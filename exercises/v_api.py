import datetime
from django.http import JsonResponse
from users.models import User
from exercises.models import UserFolder, ClubFolder, AdminFolder, UserExercise, ClubExercise, AdminExercise, ExerciseVideo
from exercises.models import UserExerciseParam, UserExerciseParamTeam
from references.models import ExsGoal, ExsBall, ExsTeamCategory, ExsAgeCategory, ExsTrainPart, ExsCognitiveLoad
from references.models import ExsKeyword, ExsStressType, ExsPurpose, ExsCoaching
from references.models import ExsCategory, ExsAdditionalData, ExsTitleName
from references.models import UserSeason, ClubSeason, UserTeam, ClubTeam
from video.models import Video
from nanofootball.views import util_check_access
from video.views import delete_video_obj_nf
from trainings.models import UserTraining, ClubTraining


LANG_CODE_DEFAULT = "en"
FOLDER_TEAM = "team_folders"
FOLDER_NFB = "nfb_folders"
FOLDER_CLUB = "club_folders"



def get_by_language_code(value, code):
    """
    Return a value by current language's code.

    :param value: Dictionary with structure("code_1": "value_1",...) for different languages. Usually "value" is STRING.
    :type value: dict[str]
    :param code: String key of any language. For example: "engilsh" -> "en", "russian" -> "ru".
    :type code: [str]
    :raise None. In case of an exception, the result: "". 
        If it was not possible to find the desired value by the key, then an attempt will be made to take the default (LANG_CODE_DEFAULT).
    :return: Value, depending on the current language.
    :rtype: [str]

    """
    res = ""
    try:
        res = value[code]
    except:
        pass
    if res == "":
        try:
            res = value[LANG_CODE_DEFAULT]
        except:
            pass
    return res


def set_by_language_code(elem, code, value, value2 = None):
    """
    Return edited object as dict where key: language code, value: string text.

    :param elem: Field of current model. Usually it defined as title, name or description.
    :type elem: [Model.field]
    :param code: String key of any language. For example: "engilsh" -> "en", "russian" -> "ru".
    :type code: [str]
    :param value: New value for returned dictionary.
    :type value: [str]
    :param value2: Additional value for replace "value".
    :type value2: [str] or None
    :return: Object which is field of the Model.
    :rtype: [object]

    """
    if value2:
        value = value2 if value2 != "" else value
    if type(elem) is dict:
        elem[code] = value
    else:
        elem = {code: value}
    return elem


def set_value_as_int(request, name, def_value = None):
    """
    Return new value for the Model's Field. Value is obtained by get from request parameter's value and try to transform it to int.
    In case of success new value will be returned else returned default value.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param name: Name of getting request parameter.
    :type name: [str]
    :param def_value: Default value for new value.
    :type def_value: [int] or None
    :return: New value.
    :rtype: [int] or None

    """
    res = def_value
    try:
        res = int(request.POST.get(name, def_value))
    except:
        pass
    return res


def set_value_as_ref(request, name, def_value = None):
    """
    Return new value as Reference Model Object. Using argument "name" the appropriate directory is selected.
    In case of success new value will be returned else returned default value.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param name: Name of getting request parameter.
    :type name: [str]
    :param def_value: Default value for new value.
    :type def_value: [int] or None
    :return: New value for setting to field.
    :rtype: [Model.object] or None

    """
    res = def_value
    ref_id = -1
    try:
        ref_id = int(request.POST.get(name, def_value))
    except:
        pass
    if name == "data[ref_goal]":
        res = ExsGoal.objects.filter(id=ref_id)
    elif name == "data[ref_ball]":
        res = ExsBall.objects.filter(id=ref_id)
    elif name == "data[ref_team_category]":
        res = ExsTeamCategory.objects.filter(id=ref_id)
    elif name == "data[ref_age_category]":
        res = ExsAgeCategory.objects.filter(id=ref_id)
    elif name == "data[ref_train_part]":
        res = ExsTrainPart.objects.filter(id=ref_id)
    elif name == "data[ref_cognitive_load]":
        res = ExsCognitiveLoad.objects.filter(id=ref_id)
    if res and res.exists() and res[0].id != None:
        res = res[0]
    else:
        res = None
    return res


def set_value_as_list(request, name, name2 = None, def_value = None):
    """
    Return new value as list which was received by request using argument "name" or additional: "name2".
    In case of success new value will be returned else returned default value.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param name: Name of getting request parameter.
    :type name: [str]
    :param name2: Additional name of getting request parameter.
    :type name2: [str]
    :param def_value: Default value for new value.
    :type def_value: [int] or None
    :return: New value for setting to field.
    :rtype: list[any] or None

    """
    res = def_value
    value_from_req = request.POST.getlist(name, def_value)
    value2_from_req = request.POST.getlist(name2, def_value)
    if name2 and type(value2_from_req) is list and len(value2_from_req) > 0:
        value_from_req = value2_from_req
    if type(value_from_req) is list and len(value_from_req) > 0:
        res = value_from_req
    return res


def set_refs_translations(data, lang_code):
    """
    Return data with new key "title". "Title" - translated value with key "translation_names" at current system's language.

    :param data: Dictionary with references' elements.
    :type data: dict[object]
    :param lang_code: String key of any language. For example: "engilsh" -> "en", "russian" -> "ru".
    :type lang_code: [str]
    :return: Dictionary with references' elements with new value for key "title".
    :rtype: dict[object]

    """
    for key in data:
        elems = data[key]
        for elem in elems:
            title = get_by_language_code(elem['translation_names'], lang_code)
            elem['title'] = title if title != "" else elem['name']
    return data


def set_as_object(request, data, name, lang):
    """
    Return changed data of JSONField, checking values from request by parametres: "type", "value", "id".
    JSONField is a dictionary whose keys are language's codes and values are list of objects:
    {'type': [str], 'value': [str], 'id': [str]}

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param data: JSONField with next template: {'en': [{'type': [str], 'value': [str], 'id': [str]}, ...], 'ru': [], ...}.
    :type data: Model.Field[object]
    :param name: Name of request parameter.
    :type name: [str]
    :param lang: String key of any language. For example: "engilsh" -> "en", "russian" -> "ru".
    :type lang: [str]
    :return: JSONField with edited values.
    :rtype: Model.Field[object]

    """
    value = []
    flag = True
    iterator = 0
    while flag:
        data_type = request.POST.get(f"data[{name}[]][{iterator}][type]")
        data_value = request.POST.get(f"data[{name}[]][{iterator}][value]")
        data_id = request.POST.get(f"data[{name}[]][{iterator}][id]")
        iterator += 1
        if iterator > 10 or data_type == None:
            flag = False
            break
        else:
            to_append = {'type': data_type, 'value': data_value}
            if data_id:
                to_append['id'] = data_id
            value.append(to_append)
    if type(data) is dict:
        data[lang] = value
    else:
        data = {lang: value}
    return data


def get_exercises_params(request, user, team):
    """
    Return data of User folders, NFB Folders, References.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param user: The current user of the system, who is currently authorized.
    :type user: <QuerySet>Model.object[User], not only ONE (Use Models.objects.filter NOT Models.objects.get to get user).
    :param team: The current team, that is selected by the user.
    :type team: [int]
    :return: List of three elements: Folders, NFB Folders, References.
    :rtype: list[object]

    """
    folders = []
    club_folders = []
    nfb_folders = []
    refs = {}
    if user.exists() and user[0].id != None:
        if util_check_access(user[0], {
            'perms_user': ["exercises.view_userfolder"], 
            'perms_club': ["exercises.view_clubfolder"]
        }):
            if request.user.club_id is not None:
                folders = ClubFolder.objects.filter(club=request.user.club_id, visible=True).values()
                club_folders = ClubFolder.objects.filter(club=request.user.club_id, visible=True).values()
            else:
                folders = UserFolder.objects.filter(user=user[0], team=team, visible=True).values()
    nfb_folders = AdminFolder.objects.filter(visible=True).values()
    for elem in folders:
        elem['root'] = False if elem['parent'] and elem['parent'] != 0 else True
    for elem in nfb_folders:
        elem['root'] = False if elem['parent'] and elem['parent'] != 0 else True
    refs['exs_goal'] = ExsGoal.objects.filter().values()
    refs['exs_ball'] = ExsBall.objects.filter().values()
    refs['exs_team_category'] = ExsTeamCategory.objects.filter().values()
    refs['exs_age_category'] = ExsAgeCategory.objects.filter().values()
    refs['exs_train_part'] = ExsTrainPart.objects.filter().values()
    refs['exs_cognitive_load'] = ExsCognitiveLoad.objects.filter().values()
    refs['exs_additional_data'] = ExsAdditionalData.objects.filter().values()
    refs['exs_keyword'] = ExsKeyword.objects.filter().values()
    refs['exs_stress_type'] = ExsStressType.objects.filter().values()
    refs['exs_purpose'] = ExsPurpose.objects.filter().values()
    refs['exs_coaching'] = ExsCoaching.objects.filter().values()
    refs['exs_category'] = ExsCategory.objects.filter().values()
    refs['exs_title_names'] = ExsTitleName.objects.filter().values()
    refs = set_refs_translations(refs, request.LANGUAGE_CODE)
    return [folders, club_folders, nfb_folders, refs]


def get_exs_scheme_data(data):
    """
    Return list of two schemas. Inaccessible scheme is changed to standard.

    :param data: Object with key "scheme_1" and "scheme_2". Values by these keys are html strings.
    :type data: [object]
    :return: List of schemas.
    :rtype: list[str]

    """
    empty_scheme = """
        <svg id="block" class="d-block bg-success mx-auto" viewBox="0 0 600 400" height="100%" width="100%" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <marker id="arrow" markerWidth="15" markerHeight="12" refX="1" refY="6" orient="auto" markerUnits="userSpaceOnUse" fill="#000000"><polyline points="1 1, 16 5.5, 1 12"></polyline></marker>
                <marker id="ffffffarrow" markerWidth="15" markerHeight="12" refX="1" refY="6" orient="auto" markerUnits="userSpaceOnUse" fill="#ffffff"><polyline points="1 1, 16 5.5, 1 12"></polyline></marker>
                <marker id="ffff00arrow" markerWidth="15" markerHeight="12" refX="1" refY="6" orient="auto" markerUnits="userSpaceOnUse" fill="#ffff00"><polyline points="1 1, 16 5.5, 1 12"></polyline></marker>
                <marker id="ff0000arrow" markerWidth="15" markerHeight="12" refX="1" refY="6" orient="auto" markerUnits="userSpaceOnUse" fill="#ff0000"><polyline points="1 1, 16 5.5, 1 12"></polyline></marker>
                <marker id="000000arrow" markerWidth="15" markerHeight="12" refX="1" refY="6" orient="auto" markerUnits="userSpaceOnUse" fill="#000000"><polyline points="1 1, 16 5.5, 1 12"></polyline></marker>
                <filter id="f3" x="0" y="0" width="200%" height="200%"><feOffset result="offOut" in="SourceAlpha" dx="5" dy="5"></feOffset><feGaussianBlur result="blurOut" in="offOut" stdDeviation="3"></feGaussianBlur><feBlend in="SourceGraphic" in2="blurOut" mode="normal"></feBlend></filter>
            </defs>
            <image id="plane" x="0" y="0" data-width="600" data-height="400" width="100%" height="100%" href="/static/exercises/img/field.svg"></image>
            <g id="selects"></g>
            <g id="figures"></g>
            <g id="lines"></g>
            <g id="objects"></g>
            <g id="dots"></g>
            <line id="xLine" x1="-1" y1="0" x2="-1" y2="1600" stroke="red" stroke-dasharray="10" stroke-width="1"></line>
            <line id="yLine" x1="0" y1="-1" x2="2400" y2="-1" stroke="red" stroke-dasharray="10" stroke-width="1"></line>
            <line id="xLine2" x1="-2400" y1="0" x2="-2400" y2="1600" stroke="red" stroke-dasharray="10" stroke-width="1"></line>
            <line id="yLine2" x1="0" y1="-1600" x2="2400" y2="-1600" stroke="red" stroke-dasharray="10" stroke-width="1"></line>
        </svg>
    """
    res = []
    if data and data['scheme_1']:
        res.append(data['scheme_1'])
    else:
        res.append(empty_scheme)
    if data and data['scheme_2']:
        res.append(data['scheme_2'])
    else:
        res.append(empty_scheme)
    return res


def get_exs_video_data(data):
    """
    Return list of videos transforming incoming argument "data".

    """
    res = []
    if data and data['data']:
        res = data['data']
    return res


def get_exs_animation_data(data):
    """
    Return list of animations transforming incoming argument "data".

    """
    res = {'custom': '', 'default': []}
    if data and data['data']:
        res = data['data']
    return res


def get_exs_video_data2(data, exs, folder_type, club_id):
    """
    Return changed data with fields: "video_1", "video_2", "animation_1", "animation_2".
    Exercise has linked videos. Using exercise object and folder's type function add these new keys.

    :param data: Exercise object with all keys.
    :type data: Model.Field[object]
    :param exs: The current exercise.
    :type exs: Model.object[UserExercise] or Model.object[ClubExercise] or Model.object[AdminExercise].
    :param folder_type: The current folder, that is selected by the user.
    :type folder_type: [str]
    :return: Updated exercise.
    :rtype: Model.Field[object]

    """
    videos = []
    if folder_type == FOLDER_NFB:
        videos = exs.videos.through.objects.filter(exercise_nfb=exs)
    elif folder_type == FOLDER_TEAM and club_id is None:
        videos = exs.videos.through.objects.filter(exercise_user=exs)
    elif folder_type == FOLDER_CLUB or folder_type == FOLDER_TEAM and club_id is not None:
        videos = exs.videos.through.objects.filter(exercise_club=exs)
    for video in videos:
        t_key = ""
        if video.type == 1:
            t_key = 'video_1'
        elif video.type == 2:
            t_key = 'video_2'
        elif video.type == 3:
            t_key = 'animation_1'
        elif video.type == 4:
            t_key = 'animation_2'
        data[t_key] = {
            'id': video.video.id if video.video else -1, 
            'links': video.video.links if video.video else ""
        }
    return data


def get_excerises_data(folder_id = -1, folder_type = "", req = None, cur_user = None, cur_team = None):
    """
    Return list of exercise objects. If filter options exist then current list will be filtered.
    Filter options are defined via next parameters of request: filter["filter_name"].

    :param folder_id: Folder's ID.
    :type folder_id: [int]
    :param folder_type: The current folder, that is selected by the user.
    :type folder_type: [str]
    :param req: Django HttpRequest.
    :type req: [HttpRequest] or None
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User] or None
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: List of filtered exercises (as objects).
    :rtype: list[object]

    """
    def days_between(date):
        return abs((datetime.date.today() - date).days)
    filter_goal = -1
    filter_ball = -1
    filter_watched = -1
    filter_favorite = -1
    filter_new_exs = -1
    filter_search = ""
    try:
        if req.method == "GET":
            filter_goal = int(req.GET.get("filter[goal]", -1))
        elif req.method == "POST":
            filter_goal = int(req.POST.get("filter[goal]", -1))
    except:
        pass
    try:
        if req.method == "GET":
            filter_ball = int(req.GET.get("filter[ball]", -1))
        elif req.method == "POST":
            filter_ball = int(req.POST.get("filter[ball]", -1))
    except:
        pass
    try:
        if req.method == "GET":
            filter_watched = int(req.GET.get("filter[watch]", -1))
        elif req.method == "POST":
            filter_watched = int(req.POST.get("filter[watch]", -1))
    except:
        pass
    try:
        if req.method == "GET":
            filter_favorite = int(req.GET.get("filter[favorite]", -1))
        elif req.method == "POST":
            filter_favorite = int(req.POST.get("filter[favorite]", -1))
    except:
        pass
    try:
        if req.method == "GET":
            filter_new_exs = int(req.GET.get("filter[new_exs]", -1))
        elif req.method == "POST":
            filter_new_exs = int(req.POST.get("filter[new_exs]", -1))
    except:
        pass
    try:
        if req.method == "GET":
            filter_search = req.GET.get("filter[_search]", "")
        elif req.method == "POST":
            filter_search = req.POST.get("filter[_search]", "")
    except:
        pass

    f_exercises = []
    c_folder = None
    child_folders = None
    if folder_type == FOLDER_TEAM:
        if req.user.club_id is not None:
            c_folder = ClubFolder.objects.filter(id=folder_id, club=req.user.club_id)
        else:
            c_folder = UserFolder.objects.filter(id=folder_id)
        if not c_folder.exists() or c_folder[0].id == None:
            # return JsonResponse({"err": "Folder not found.", "success": False}, status=200)
            return []
        if req.user.club_id is not None:
            child_folders = ClubFolder.objects.filter(parent=c_folder[0].id, club=req.user.club_id)
        else:
            child_folders = UserFolder.objects.filter(parent=c_folder[0].id)
        if child_folders.count() > 0:
            if req.user.club_id is not None:
                f_exercises = ClubExercise.objects.filter(folder__in = child_folders, team=cur_team)
            else:
                f_exercises = UserExercise.objects.filter(folder__in = child_folders)
        else:
            if req.user.club_id is not None:
                f_exercises = ClubExercise.objects.filter(folder = c_folder[0], team=cur_team)
            else:
                f_exercises = UserExercise.objects.filter(folder = c_folder[0])
    elif folder_type == FOLDER_NFB:
        c_folder = AdminFolder.objects.filter(id=folder_id)
        if not c_folder.exists() or c_folder[0].id == None:
            # return JsonResponse({"err": "Folder not found.", "success": False}, status=200)
            return []
        child_folders = AdminFolder.objects.filter(parent=c_folder[0].id)
        if child_folders.count() > 0:
            f_exercises = AdminExercise.objects.filter(folder__in = child_folders)
        else:
            f_exercises = AdminExercise.objects.filter(folder = c_folder[0])
    elif folder_type == FOLDER_CLUB:
        if req.user.club_id is not None:
            c_folder = ClubFolder.objects.filter(id=folder_id, club=req.user.club_id)
            if not c_folder.exists() or c_folder[0].id == None:
                # return JsonResponse({"err": "Folder not found.", "success": False}, status=200)
                return []
            child_folders = ClubFolder.objects.filter(parent=c_folder[0].id, club=req.user.club_id)
            if child_folders.count() > 0:
                f_exercises = ClubExercise.objects.filter(folder__in = child_folders)
            else:
                f_exercises = ClubExercise.objects.filter(folder = c_folder[0])
    f_exercises = [entry for entry in f_exercises.values()]
    for exercise in f_exercises:
        exercise['search_title'] = get_by_language_code(exercise['title'], req.LANGUAGE_CODE).lower()
        exercise['has_video_1'] = False
        exercise['has_video_2'] = False
        exercise['has_animation_1'] = False
        exercise['has_animation_2'] = False
        videos_arr = get_exs_video_data(exercise['video_data'])
        anims_arr = get_exs_video_data(exercise['animation_data'])
        if isinstance(anims_arr, dict):
            anims_arr = anims_arr['default']
        if len(videos_arr) == 2:
            if videos_arr[0] != -1:
                exercise['has_video_1'] = True
            if videos_arr[1] != -1:
                exercise['has_video_2'] = True
        if len(anims_arr) == 2:
            if anims_arr[0] != -1:
                exercise['has_animation_1'] = True
            if anims_arr[1] != -1:
                exercise['has_animation_2'] = True
        user_params = None
        if folder_type == FOLDER_TEAM:
            if req.user.club_id is not None:
                user_params = UserExerciseParam.objects.filter(exercise_club=exercise['id'], user=cur_user)
            else:
                user_params = UserExerciseParam.objects.filter(exercise_user=exercise['id'], user=cur_user)
        elif folder_type == FOLDER_NFB:
            user_params = UserExerciseParam.objects.filter(exercise_nfb=exercise['id'], user=cur_user)
            if cur_user.is_superuser:
                notes = UserExerciseParamTeam.objects.filter(exercise_nfb=exercise['id']).only('id', 'note')
                if notes.exists() and notes[0].id != None:
                    notes = notes[0].note
                    if notes and req.LANGUAGE_CODE in notes and notes[req.LANGUAGE_CODE] and len(notes[req.LANGUAGE_CODE]) > 0:
                        exercise['has_notes'] = True
        elif folder_type == FOLDER_CLUB:
            user_params = UserExerciseParam.objects.filter(exercise_club=exercise['id'], user=cur_user)
        if user_params != None and user_params.exists() and user_params[0].id != None:
            user_params = user_params.values()[0]
            exercise['favorite'] = user_params['favorite']
            exercise['video_1_watched'] = user_params['video_1_watched']
            exercise['video_2_watched'] = user_params['video_2_watched']
            exercise['animation_1_watched'] = user_params['animation_1_watched']
            exercise['animation_2_watched'] = user_params['animation_2_watched']
        watched_status = 0
        if 'video_1_watched' in exercise:
            if exercise['has_video_1'] and exercise['video_1_watched']:
                watched_status = 1
        if 'video_2_watched' in exercise:
            if exercise['has_video_2'] and exercise['video_2_watched']:
                watched_status = 1
        if 'animation_1_watched' in exercise:
            if exercise['has_animation_1'] and exercise['animation_1_watched']:
                watched_status = 1
        if 'animation_2_watched' in exercise:
            if exercise['has_animation_2'] and exercise['animation_2_watched']:
                watched_status = 1
        favorite_status = 0
        if 'favorite' in exercise:
            favorite_status = 1 if exercise['favorite'] else 0
        exercise['watched_status'] = watched_status
        exercise['favorite_status'] = favorite_status

    if filter_goal != -1:
        f_exercises = list(filter(lambda c: c['ref_goal_id'] == filter_goal, f_exercises))
    if filter_ball != -1:
        f_exercises = list(filter(lambda c: c['ref_ball_id'] == filter_ball, f_exercises))
    if filter_watched != -1:
        f_exercises = list(filter(lambda c: c['watched_status'] == filter_watched, f_exercises))
    if filter_favorite != -1:
        f_exercises = list(filter(lambda c: c['favorite_status'] == filter_favorite, f_exercises))
    if filter_new_exs != -1:
        f_exercises = list(filter(lambda c: days_between(c['date_creation']) < 15, f_exercises))
    if filter_search != "":
        filter_search = filter_search.lower()
        f_exercises = list(filter(lambda c: filter_search in c['search_title'], f_exercises))
    return f_exercises


def check_video(id):
    """
    Return Video object if it existed by ID or None.

    :param id: Video's ID.
    :type id: [int]
    :return: Video object or None.
    :rtype: Model.object[Video]

    """
    f_video = Video.objects.filter(id=id)
    if f_video.exists() and f_video[0].id != None:
        return f_video[0]
    return None


# --------------------------------------------------
# EXERCISES API
def POST_copy_exs(request, cur_user, cur_team):
    """
    Return JSON Response as result on POST operation "Copy exercise". User can copy the exercise from
    NFB folder or from TEAM folder. Copied exercise from NFB Folder is not available to edit video, animation and schemas.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    exs_id = -1
    folder_id = -1
    folder_type = request.POST.get("type", "")
    try:
        exs_id = int(request.POST.get("exs", -1))
    except:
        pass
    try:
        folder_id = int(request.POST.get("folder", -1))
    except:
        pass
    found_folder = None
    if not util_check_access(cur_user, {
        'perms_user': ["exercises.change_userexercise", "exercises.add_userexercise"], 
        'perms_club': ["exercises.change_clubexercise", "exercises.add_clubexercise"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    if request.user.club_id is not None:
        found_folder = ClubFolder.objects.filter(id=folder_id, club=request.user.club_id)
    else:
        found_folder = UserFolder.objects.filter(id=folder_id)
    success_status = False
    c_exs = None
    new_exs = None
    found_team = None
    if request.user.club_id is not None:
        found_team = ClubTeam.objects.filter(id=cur_team, club_id=request.user.club_id)
    else:
        found_team = UserTeam.objects.filter(id=cur_team, user_id=cur_user)
    if not found_team or not found_team.exists() or found_team[0].id == None:
        return JsonResponse({"err": "Cant find team.", "success": False}, status=400)
    if found_folder and found_folder.exists() and found_folder[0].id != None:
        res_data = {'err': "NULL"}
        if folder_type == FOLDER_NFB:
            c_exs = AdminExercise.objects.filter(id=exs_id, visible=True)
            if c_exs.exists() and c_exs[0].id != None:
                if request.user.club_id is not None:
                    new_exs = ClubExercise(user=cur_user, club=request.user.club_id, team=found_team[0])
                else:
                    new_exs = UserExercise(user=cur_user)
                for key in c_exs.values()[0]:
                    if key != "id" and key != "date_creation":
                        setattr(new_exs, key, c_exs.values()[0][key])
                new_exs.folder = found_folder[0]
                new_exs.old_id = exs_id
                try:
                    new_exs.save()
                    res_data = {'id': new_exs.id}
                    success_status = True
                except Exception as e:
                    print(e)
                    res_data = {'id': new_exs.id, 'err': str(e)}
                exs_params = UserExerciseParamTeam.objects.filter(exercise_nfb=exs_id)
                if exs_params.exists() and exs_params[0].id != None and success_status:
                    if found_team and found_team.exists() and found_team[0].id != None:
                        new_exs_params = None
                        if request.user.club_id is not None:
                            new_exs_params = UserExerciseParamTeam(exercise_club=new_exs, team_club=found_team[0])
                        else:
                            new_exs_params = UserExerciseParamTeam(exercise_user=new_exs, team=found_team[0])
                        for key in exs_params.values()[0]:
                            if key != "id" and key != "exercise_user_id" and key != "exercise_club_id" and key != "exercise_nfb_id" and key != "team_id":
                                setattr(new_exs_params, key, exs_params.values()[0][key])
                        try:
                            new_exs_params.save()
                            res_data['exs_params'] = new_exs_params.id
                            success_status = True
                        except Exception as e:
                            success_status = False
                            res_data = {'id': new_exs.id, 'err': str(e)}
        elif folder_type == FOLDER_TEAM:
            c_exs = None
            if request.user.club_id is not None:
                c_exs = ClubExercise.objects.filter(id=exs_id, team=found_team[0], club=request.user.club_id)
            else:
                c_exs = UserExercise.objects.filter(id=exs_id, user=cur_user)
            if c_exs.exists() and c_exs[0].id != None:
                new_exs = None
                if request.user.club_id is not None:
                    new_exs = ClubExercise(user=cur_user, club=request.user.club_id, team=found_team[0])
                else:
                    new_exs = UserExercise(user=cur_user)
                for key in c_exs.values()[0]:
                    if key != "id" and key != "date_creation":
                        setattr(new_exs, key, c_exs.values()[0][key])
                new_exs.folder = found_folder[0]
                try:
                    new_exs.save()
                    res_data = {'id': new_exs.id}
                    success_status = True
                except Exception as e:
                    res_data = {'id': new_exs.id, 'err': str(e)}
        elif folder_type == FOLDER_CLUB:
            pass
        if c_exs and new_exs:
            try:
                videos = []
                if folder_type == FOLDER_NFB:
                    videos = c_exs[0].videos.through.objects.filter(exercise_nfb=c_exs[0])
                elif folder_type == FOLDER_TEAM:
                    if request.user.club_id is not None:
                        videos = c_exs[0].videos.through.objects.filter(exercise_club=c_exs[0])
                    else:
                        videos = c_exs[0].videos.through.objects.filter(exercise_user=c_exs[0])
                elif folder_type == FOLDER_CLUB:
                    videos = c_exs[0].videos.through.objects.filter(exercise_club=c_exs[0])
                for video in videos:
                    video.pk = None
                    video.exercise_nfb = None
                    video.exercise_user = None
                    video.exercise_club = None
                    if request.user.club_id is not None:
                        video.exercise_club = new_exs
                    else:
                        video.exercise_user = new_exs
                    video.save()
                    new_exs.videos.through.objects.add(video)
                res_data = {'videos': "OK"}
            except Exception as e:
                print(e)
                res_data = {'err': str(e)}
        return JsonResponse({"data": res_data, "success": success_status}, status=200)
    return JsonResponse({"errors": "Can't copy exercise"}, status=400)


def POST_move_exs(request, cur_user, cur_team):
    """
    Return JSON Response as result on POST operation "Moving exercise". This works only for TEAM exercises.
    User can't move exercise from NFB folder to another.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    exs_id = -1
    folder_id = -1
    try:
        exs_id = int(request.POST.get("exs", -1))
    except:
        pass
    try:
        folder_id = int(request.POST.get("folder", -1))
    except:
        pass
    found_folder = None
    if not util_check_access(cur_user, {
        'perms_user': ["exercises.change_userexercise"], 
        'perms_club': ["exercises.change_clubexercise"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    if request.user.club_id is not None:
         found_folder = ClubFolder.objects.filter(id=folder_id, club=request.user.club_id)
    else:
        found_folder = UserFolder.objects.filter(id=folder_id, user=cur_user)
    if found_folder.exists() and found_folder[0].id != None:
        found_exs = None
        if request.user.club_id is not None:
            found_exs = ClubExercise.objects.filter(id=exs_id, club=request.user.club_id, team=cur_team)
        else:
            found_exs = UserExercise.objects.filter(id=exs_id, user=cur_user)
        if found_exs and found_exs.exists() and found_exs[0].id != None:
            found_exs = found_exs[0]
            found_exs.folder = found_folder[0]
            try:
                found_exs.save()
                return JsonResponse({"data": {"id": found_exs.id}, "success": True}, status=200)
            except:
                pass
    return JsonResponse({"errors": "Can't move exercise"}, status=400)


def POST_edit_exs(request, cur_user, cur_team):
    """
    Return JSON Response as result on POST operation "Edit exercise". Editing exercise's object, UserExerciseParamTeam's object.
    Only user with adminstrator status can edit NFB exercises.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    exs_id = -1
    folder_id = -1
    folder_type = request.POST.get("type", "")
    try:
        exs_id = int(request.POST.get("exs", -1))
    except:
        pass
    try:
        folder_id = int(request.POST.get("data[folder_main]", -1))
    except:
        pass
    c_exs = None
    access_denied = False
    copied_from_nfb = False
    found_team = None
    if request.user.club_id is not None:
        found_team = ClubTeam.objects.filter(id=cur_team, club_id=request.user.club_id)
    else:
        found_team = UserTeam.objects.filter(id=cur_team, user_id=cur_user)
    if folder_type == FOLDER_TEAM:
        if not found_team or not found_team.exists() or found_team[0].id == None:
            return JsonResponse({"err": "Team not found.", "success": False}, status=400)
        if not util_check_access(cur_user, {
            'perms_user': ["exercises.change_userexercise", "exercises.add_userexercise"], 
            'perms_club': ["exercises.change_clubexercise", "exercises.add_clubexercise"]
        }):
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        c_folder = None
        if request.user.club_id is not None:
            c_folder = ClubFolder.objects.filter(id=folder_id, club=request.user.club_id)
        else:
            c_folder = UserFolder.objects.filter(id=folder_id, user=cur_user)
        if not c_folder.exists() or c_folder[0].id == None:
            return JsonResponse({"err": "Folder not found.", "success": False}, status=400)
        c_exs = None
        if request.user.club_id is not None:
            c_exs = ClubExercise.objects.filter(id=exs_id, club=request.user.club_id, team=found_team[0])
        else:
            c_exs = UserExercise.objects.filter(id=exs_id, user=cur_user)
        if not c_exs.exists() or c_exs[0].id == None:
            if request.user.club_id is not None:
                c_exs = ClubExercise(user=cur_user, folder=c_folder[0], club=request.user.club_id, team=found_team[0])
            else:
                c_exs = UserExercise(user=cur_user, folder=c_folder[0])
        else:
            c_exs = c_exs[0]
            c_exs.folder = c_folder[0]
            copied_from_nfb = c_exs.old_id != None
    elif folder_type == FOLDER_NFB:
        if not util_check_access(cur_user, {
            'perms_user': ["exercises.change_adminexercise", "exercises.add_adminexercise"], 
            'perms_club': ["exercises.change_adminexercise", "exercises.add_adminexercise"]
        }):
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        c_folder = AdminFolder.objects.filter(id=folder_id, visible=True)
        if not c_folder.exists() or c_folder[0].id == None:
            return JsonResponse({"err": "Folder not found.", "success": False}, status=400)
        c_exs = AdminExercise.objects.filter(id=exs_id)
        if not c_exs.exists() or c_exs[0].id == None:
            c_exs = AdminExercise(folder=c_folder[0])
        else:
            c_exs = c_exs[0]
            c_exs.folder = c_folder[0]
    elif folder_type == FOLDER_CLUB:
        if not found_team or not found_team.exists() or found_team[0].id == None:
            return JsonResponse({"err": "Team not found.", "success": False}, status=400)
        if access_denied:
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        pass
    if c_exs == None:
            return JsonResponse({"err": "Exercise not found.", "success": False}, status=400)
    print(request.POST)
    c_exs.title = set_by_language_code(c_exs.title, request.LANGUAGE_CODE, request.POST.get("data[title]", ""))
    c_exs.description = set_by_language_code(c_exs.description, request.LANGUAGE_CODE, request.POST.get("data[description]", ""))
    c_exs.ref_goal = set_value_as_ref(request, "data[ref_goal]", None)
    c_exs.ref_ball = set_value_as_ref(request, "data[ref_ball]", None)
    c_exs.ref_team_category = set_value_as_ref(request, "data[ref_team_category]", None)
    c_exs.ref_age_category = set_value_as_ref(request, "data[ref_age_category]", None)
    c_exs.ref_train_part = set_value_as_ref(request, "data[ref_train_part]", None)
    c_exs.ref_cognitive_load = set_value_as_ref(request, "data[ref_cognitive_load]", None)

    video1_id = -1
    video2_id = -1
    animation1_id = -1
    animation2_id = -1
    if not copied_from_nfb:
        if type(c_exs.scheme_data) is dict:
            c_exs.scheme_data['scheme_1'] = request.POST.get("data[scheme_1]")
            c_exs.scheme_data['scheme_2'] = request.POST.get("data[scheme_2]")
        else:
            c_exs.scheme_data = {
                'scheme_1': request.POST.get("data[scheme_1]"),
                'scheme_2': request.POST.get("data[scheme_2]")
            }   
        video1_id = int(request.POST.get("data[video_1]")) if request.POST.get("data[video_1]").isdigit() else -1
        video2_id = int(request.POST.get("data[video_2]")) if request.POST.get("data[video_2]").isdigit() else -1
        if type(c_exs.video_data) is dict:
            c_exs.video_data['data'] = [video1_id, video2_id]
        else:
            c_exs.video_data = {'data': [video1_id, video2_id]}
        animation1_id = int(request.POST.get("data[animation_1]")) if request.POST.get("data[animation_1]").isdigit() else -1
        animation2_id = int(request.POST.get("data[animation_2]")) if request.POST.get("data[animation_2]").isdigit() else -1
        if type(c_exs.animation_data) is dict:
            c_exs.animation_data['data']['default'] = [animation1_id, animation2_id]
        else:
            c_exs.animation_data = {'data': {'custom': "", 'default': [animation1_id, animation2_id]}}
    try:
        c_exs.save()
        res_data = f'Exs with id: [{c_exs.id}] is added / edited successfully.'
    except Exception as e:
        return JsonResponse({"err": "Can't edit the exs.", "success": False}, status=200)
    
    video1_obj = check_video(video1_id)
    video2_obj = check_video(video2_id)
    animation1_obj = check_video(animation1_id)
    animation2_obj = check_video(animation2_id)
    try:
        if folder_type == FOLDER_TEAM and request.user.club_id is None:
            c_exs.videos.through.objects.update_or_create(type=1, exercise_user=c_exs, defaults={"video": video1_obj})
            c_exs.videos.through.objects.update_or_create(type=2, exercise_user=c_exs, defaults={"video": video2_obj})
            c_exs.videos.through.objects.update_or_create(type=3, exercise_user=c_exs, defaults={"video": animation1_obj})
            c_exs.videos.through.objects.update_or_create(type=4, exercise_user=c_exs, defaults={"video": animation2_obj})
        elif folder_type == FOLDER_NFB:
            c_exs.videos.through.objects.update_or_create(type=1, exercise_nfb=c_exs, defaults={"video": video1_obj})
            c_exs.videos.through.objects.update_or_create(type=2, exercise_nfb=c_exs, defaults={"video": video2_obj})
            c_exs.videos.through.objects.update_or_create(type=3, exercise_nfb=c_exs, defaults={"video": animation1_obj})
            c_exs.videos.through.objects.update_or_create(type=4, exercise_nfb=c_exs, defaults={"video": animation2_obj})
        elif folder_type == FOLDER_CLUB or folder_type == FOLDER_TEAM and request.user.club_id is not None:
            c_exs.videos.through.objects.update_or_create(type=1, exercise_club=c_exs, defaults={"video": video1_obj})
            c_exs.videos.through.objects.update_or_create(type=2, exercise_club=c_exs, defaults={"video": video2_obj})
            c_exs.videos.through.objects.update_or_create(type=3, exercise_club=c_exs, defaults={"video": animation1_obj})
            c_exs.videos.through.objects.update_or_create(type=4, exercise_club=c_exs, defaults={"video": animation2_obj})
    except Exception as e:
        print(e)
        res_data += f'Cant add link to <ExerciseVideo>.'

    if folder_type == FOLDER_TEAM:
        if found_team.exists() and found_team[0].id != None:
            c_exs_team_params = None
            if request.user.club_id is not None:
                c_exs_team_params = UserExerciseParamTeam.objects.filter(team_club=found_team[0], exercise_club=c_exs)
            else:
                c_exs_team_params = UserExerciseParamTeam.objects.filter(team=found_team[0], exercise_user=c_exs)
            if not c_exs_team_params.exists() or c_exs_team_params[0].id == None:
                if request.user.club_id is not None:
                    c_exs_team_params = UserExerciseParamTeam(team_club=found_team[0], exercise_club=c_exs)
                else:
                    c_exs_team_params = UserExerciseParamTeam(team=found_team[0], exercise_user=c_exs)
            else:
                c_exs_team_params = c_exs_team_params[0]
            c_exs_team_params.additional_data = set_as_object(request, c_exs_team_params.additional_data, "additional_data", request.LANGUAGE_CODE)
            c_exs_team_params.keyword = set_as_object(request, c_exs_team_params.keyword, "keyword", request.LANGUAGE_CODE)
            c_exs_team_params.stress_type = set_as_object(request, c_exs_team_params.stress_type, "stress_type", request.LANGUAGE_CODE)
            c_exs_team_params.purpose = set_as_object(request, c_exs_team_params.purpose, "purposes", request.LANGUAGE_CODE)
            c_exs_team_params.coaching = set_as_object(request, c_exs_team_params.coaching, "coaching", request.LANGUAGE_CODE)
            c_exs_team_params.note = set_as_object(request, c_exs_team_params.note, "notes", request.LANGUAGE_CODE)
            try:
                c_exs_team_params.save()
                res_data += '\nAdded team params for exs.'
            except:
                res_data += '\nCant add team params for exs.'
    elif folder_type == FOLDER_NFB:
        c_exs_team_params = UserExerciseParamTeam.objects.filter(exercise_nfb=c_exs)
        if not c_exs_team_params.exists() or c_exs_team_params[0].id == None:
            c_exs_team_params = UserExerciseParamTeam(exercise_nfb=c_exs)
        else:
            c_exs_team_params = c_exs_team_params[0]
        c_exs_team_params.additional_data = set_as_object(request, c_exs_team_params.additional_data, "additional_data", request.LANGUAGE_CODE)
        c_exs_team_params.keyword = set_as_object(request, c_exs_team_params.keyword, "keyword", request.LANGUAGE_CODE)
        c_exs_team_params.stress_type = set_as_object(request, c_exs_team_params.stress_type, "stress_type", request.LANGUAGE_CODE)
        c_exs_team_params.purpose = set_as_object(request, c_exs_team_params.purpose, "purposes", request.LANGUAGE_CODE)
        c_exs_team_params.coaching = set_as_object(request, c_exs_team_params.coaching, "coaching", request.LANGUAGE_CODE)
        c_exs_team_params.note = set_as_object(request, c_exs_team_params.note, "notes", request.LANGUAGE_CODE)
        try:
            c_exs_team_params.save()
            res_data += '\nAdded team params for exs.'
        except:
            res_data += '\nCant add team params for exs.'
    elif folder_type == FOLDER_CLUB:
        pass
    return JsonResponse({"data": res_data, "success": True}, status=200)


def POST_delete_exs(request, cur_user, cur_team):
    """
    Return JSON Response as result on POST operation "Delete exercise".
    Only user with adminstrator status can delete NFB exercises.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    exs_id = -1
    delete_type = 0
    delete_type_access = False
    folder_type = request.POST.get("type", "")
    try:
        exs_id = int(request.POST.get("exs", -1))
    except:
        pass
    try:
        delete_type = int(request.POST.get("delete_type", -1)) # delete only exercise, only video in it, or both
    except:
        pass
    c_exs = None
    f_exs_in_training = None
    if folder_type == FOLDER_TEAM:
        if not util_check_access(cur_user, {
            'perms_user': ["exercises.delete_userexercise"], 
            'perms_club': ["exercises.delete_clubexercise"]
        }):
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        if request.user.club_id is not None:
            c_exs = ClubExercise.objects.filter(id=exs_id, club=request.user.club_id, team=cur_team)
            if c_exs.exists() and c_exs[0].id != None:
                f_exs_in_training = ClubTraining.objects.filter(event_id__club_id=request.user.club_id, exercises__in=c_exs)
        else:
            c_exs = UserExercise.objects.filter(id=exs_id, user=cur_user)
            print(c_exs[0])
            if c_exs.exists() and c_exs[0].id != None:
                f_exs_in_training = UserTraining.objects.filter(event_id__user_id=cur_user, exercises__in=c_exs)
    elif folder_type == FOLDER_NFB:
        if not util_check_access(cur_user, {
            'perms_user': ["exercises.delete_adminexercise"], 
            'perms_club': ["exercises.delete_adminexercise"]
        }):
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        delete_type_access = True
        c_exs = AdminExercise.objects.filter(id=exs_id)
    elif folder_type == FOLDER_CLUB:
        pass
    if c_exs == None or not c_exs.exists() or c_exs[0].id == None:
        return JsonResponse({"errors": "access_error"}, status=400)
    else:
        if f_exs_in_training != None and f_exs_in_training.exists() and f_exs_in_training[0].event_id != None:
            return JsonResponse({"errors": "access_error", "in_training": True}, status=400)
        try:
            if not delete_type_access:
                c_exs.delete()
            else:
                if delete_type == 0:
                    c_exs.delete()
                elif delete_type == 1 or delete_type == 2:
                    exs_videos = c_exs[0].videos.through.objects.filter(exercise_nfb=c_exs[0])
                    for video in exs_videos:
                        if video.video is not None:
                            ready_to_delete = delete_video_obj_nf(video.video)
                            if ready_to_delete:
                                video.video.delete()
                    if delete_type == 2:
                        c_exs.delete()
            return JsonResponse({"data": {"id": exs_id}, "success": True}, status=200)
        except Exception as e:
            print(e)
            return JsonResponse({"errors": "Can't delete exercise"}, status=400)



def GET_get_exs_all(request, cur_user, cur_team):
    """
    Return JSON Response as result on GET operation "Get all exercises from folder".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]]

    """
    folder_id = -1
    folder_type = ""
    try:
        folder_id = int(request.GET.get("folder", -1))
    except:
        pass
    try:
        folder_type = request.GET.get("f_type", "")
    except:
        pass
    res_exs = []
    if not util_check_access(cur_user, {
        'perms_user': ["exercises.view_userexercise"], 
        'perms_club': ["exercises.view_clubexercise"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    found_exercises = get_excerises_data(folder_id, folder_type, request, cur_user, cur_team)
    print(found_exercises)
    for exercise in found_exercises:
        exs_title = get_by_language_code(exercise['title'], request.LANGUAGE_CODE)
        exs_data = {
            'id': exercise['id'], 
            'folder': exercise['folder_id'], 
            'title': exs_title,
            'has_video_1': exercise['has_video_1'],
            'has_video_2': exercise['has_video_2'],
            'has_animation_1': exercise['has_animation_1'],
            'has_animation_2': exercise['has_animation_2']
        }
        videos_arr = get_exs_video_data(exercise['video_data'])
        anims_arr = get_exs_video_data(exercise['animation_data'])
        if isinstance(anims_arr, dict):
            anims_arr = anims_arr['default']
        if folder_type == FOLDER_TEAM:
            exs_data['user'] = exercise['user_id']
        elif folder_type == FOLDER_NFB:
            exs_data['user'] = "NFB"
        elif folder_type == FOLDER_CLUB:
            pass
        exs_data['favorite'] = exercise['favorite'] if 'favorite' in exercise else None
        exs_data['video_1_watched'] = exercise['video_1_watched'] if 'video_1_watched' in exercise else None
        exs_data['video_2_watched'] = exercise['video_2_watched'] if 'video_2_watched' in exercise else None
        exs_data['animation_1_watched'] = exercise['animation_1_watched'] if 'animation_1_watched' in exercise else None
        exs_data['animation_2_watched'] = exercise['animation_2_watched'] if 'animation_2_watched' in exercise else None
        goal_shortcode = ExsGoal.objects.filter(id = exercise['ref_goal_id']).only('id', 'short_name')
        if goal_shortcode.exists() and goal_shortcode[0].id != None:
            goal_shortcode = goal_shortcode[0].short_name
        else:
            goal_shortcode = None
        exs_data['goal_code'] = goal_shortcode
        exs_data['ball_val'] = exercise['ref_ball_id']
        exs_data['favorite'] = exercise['favorite'] if 'favorite' in exercise else None
        exs_data['has_notes'] = exercise['has_notes'] if 'has_notes' in exercise else None
        res_exs.append(exs_data)
    # sorting list by title:
    for elem in res_exs:
        if isinstance(elem['title'], str):
            elem['title_for_sort'] = elem['title'].replace(" ", "")
        else:
            elem['title'] = ""
            elem['title_for_sort'] = ""
    res_exs = sorted(res_exs, key=lambda d: d['title_for_sort'])
    return JsonResponse({"data": res_exs, "success": True}, status=200)


def GET_get_exs_one(request, cur_user, cur_team, additional={}):
    """
    Return JSON Response or object as result on GET operation "Get one exercise".
    If keys "f_type" and "exs" will be in <additional> dictionary then function return Object or None
    else JSON Response.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :param additional: Uses for custom change folder's type and exercise's id.
    :type additional: dict[]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code) or as exercise's object.
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]] or Object

    """
    exs_id = -1
    folder_type = request.GET.get("f_type", "")
    try:
        exs_id = int(request.GET.get("exs", -1))
    except:
        pass
    is_as_object = False
    if "f_type" in additional and "exs" in additional:
        folder_type = additional['f_type']
        exs_id = additional['exs']
        is_as_object = True
    res_exs = {}
    c_exs = None
    if folder_type == FOLDER_TEAM:
        if not util_check_access(cur_user, {
            'perms_user': ["exercises.view_userexercise"], 
            'perms_club': ["exercises.view_clubexercise"]
        }):
            if is_as_object:
                return None
            else:
                return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        if request.user.club_id is not None:
            c_exs = ClubExercise.objects.filter(id=exs_id, visible=True, club=request.user.club_id, team=cur_team)
        else:
            c_exs = UserExercise.objects.filter(id=exs_id, visible=True, user=cur_user)
        if c_exs.exists() and c_exs[0].id != None:
            res_exs = c_exs.values()[0]
            res_exs['nfb'] = False
            res_exs['folder_parent_id'] = c_exs[0].folder.parent
            res_exs['copied_from_nfb'] = c_exs[0].old_id != None
        user_params = None
        if request.user.club_id is not None:
            user_params = UserExerciseParam.objects.filter(exercise_club=c_exs[0].id, user=cur_user)
        else:
            user_params = UserExerciseParam.objects.filter(exercise_user=c_exs[0].id, user=cur_user)
        if user_params.exists() and user_params[0].id != None:
            user_params = user_params.values()[0]
            res_exs['favorite'] = user_params['favorite']
            res_exs['video_1_watched'] = user_params['video_1_watched']
            res_exs['video_2_watched'] = user_params['video_2_watched']
            res_exs['animation_1_watched'] = user_params['animation_1_watched']
            res_exs['animation_2_watched'] = user_params['animation_2_watched']
        team_params = None
        if request.user.club_id is not None:
            team_params = UserExerciseParamTeam.objects.filter(exercise_club=c_exs[0].id, team_club=cur_team)
        else:
            team_params = UserExerciseParamTeam.objects.filter(exercise_user=c_exs[0].id, team=cur_team)
        if team_params.exists() and team_params[0].id != None:
            team_params = team_params.values()[0]
            res_exs['additional_data'] = get_by_language_code(team_params['additional_data'], request.LANGUAGE_CODE)
            res_exs['keyword'] = get_by_language_code(team_params['keyword'], request.LANGUAGE_CODE)
            res_exs['stress_type'] = get_by_language_code(team_params['stress_type'], request.LANGUAGE_CODE)
            res_exs['purposes'] = get_by_language_code(team_params['purpose'], request.LANGUAGE_CODE)
            res_exs['coaching'] = get_by_language_code(team_params['coaching'], request.LANGUAGE_CODE)
            res_exs['notes'] = get_by_language_code(team_params['note'], request.LANGUAGE_CODE)
    elif folder_type == FOLDER_NFB:
        c_exs = AdminExercise.objects.filter(id=exs_id, visible=True)
        if c_exs.exists() and c_exs[0].id != None:
            res_exs = c_exs.values()[0]
            res_exs['nfb'] = True
            res_exs['folder_parent_id'] = c_exs[0].folder.parent
        user_params = UserExerciseParam.objects.filter(exercise_nfb=c_exs[0].id, user=cur_user)
        if user_params.exists() and user_params[0].id != None:
            user_params = user_params.values()[0]
            res_exs['favorite'] = user_params['favorite']
            res_exs['video_1_watched'] = user_params['video_1_watched']
            res_exs['video_2_watched'] = user_params['video_2_watched']
            res_exs['animation_1_watched'] = user_params['animation_1_watched']
            res_exs['animation_2_watched'] = user_params['animation_2_watched']
        team_params = UserExerciseParamTeam.objects.filter(exercise_nfb=c_exs[0].id)
        if team_params.exists() and team_params[0].id != None:
            team_params = team_params.values()[0]
            res_exs['additional_data'] = get_by_language_code(team_params['additional_data'], request.LANGUAGE_CODE)
            res_exs['keyword'] = get_by_language_code(team_params['keyword'], request.LANGUAGE_CODE)
            res_exs['stress_type'] = get_by_language_code(team_params['stress_type'], request.LANGUAGE_CODE)
            res_exs['purposes'] = get_by_language_code(team_params['purpose'], request.LANGUAGE_CODE)
            res_exs['coaching'] = get_by_language_code(team_params['coaching'], request.LANGUAGE_CODE)
            res_exs['notes'] = get_by_language_code(team_params['note'], request.LANGUAGE_CODE)
    elif folder_type == FOLDER_CLUB:
        if not util_check_access(cur_user, {
            'perms_user': ["exercises.view_userexercise"], 
            'perms_club': ["exercises.view_clubexercise"]
        }):
            if is_as_object:
                return None
            else:
                return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        if request.user.club_id is not None:
            c_exs = ClubExercise.objects.filter(id=exs_id, visible=True, club=request.user.club_id)
        if c_exs and c_exs.exists() and c_exs[0].id != None:
            res_exs = c_exs.values()[0]
            res_exs['nfb'] = False
            res_exs['folder_parent_id'] = c_exs[0].folder.parent
            res_exs['copied_from_nfb'] = c_exs[0].old_id != None
        user_params = None
        if request.user.club_id is not None:
            user_params = UserExerciseParam.objects.filter(exercise_club=c_exs[0].id, user=cur_user)
        if user_params and user_params.exists() and user_params[0].id != None:
            user_params = user_params.values()[0]
            res_exs['favorite'] = user_params['favorite']
            res_exs['video_1_watched'] = user_params['video_1_watched']
            res_exs['video_2_watched'] = user_params['video_2_watched']
            res_exs['animation_1_watched'] = user_params['animation_1_watched']
            res_exs['animation_2_watched'] = user_params['animation_2_watched']
        team_params = None
        if request.user.club_id is not None:
            team_params = UserExerciseParamTeam.objects.filter(exercise_club=c_exs[0].id, team_club=cur_team)
        if team_params and team_params.exists() and team_params[0].id != None:
            team_params = team_params.values()[0]
            res_exs['additional_data'] = get_by_language_code(team_params['additional_data'], request.LANGUAGE_CODE)
            res_exs['keyword'] = get_by_language_code(team_params['keyword'], request.LANGUAGE_CODE)
            res_exs['stress_type'] = get_by_language_code(team_params['stress_type'], request.LANGUAGE_CODE)
            res_exs['purposes'] = get_by_language_code(team_params['purpose'], request.LANGUAGE_CODE)
            res_exs['coaching'] = get_by_language_code(team_params['coaching'], request.LANGUAGE_CODE)
            res_exs['notes'] = get_by_language_code(team_params['note'], request.LANGUAGE_CODE)
    else:
        if is_as_object:
            return None
        else:
            return JsonResponse({"errors": "Exercise not found.", "success": False}, status=400)
    res_exs['title'] = get_by_language_code(res_exs['title'], request.LANGUAGE_CODE)
    res_exs['description'] = get_by_language_code(res_exs['description'], request.LANGUAGE_CODE)
    res_exs['scheme_data'] = get_exs_scheme_data(res_exs['scheme_data'])
    res_exs['video_data'] = get_exs_video_data(res_exs['video_data'])
    res_exs['animation_data'] = get_exs_animation_data(res_exs['animation_data'])
    res_exs['ref_goal'] = res_exs['ref_goal_id']
    res_exs['ref_ball'] = res_exs['ref_ball_id']
    res_exs['ref_team_category'] = res_exs['ref_team_category_id']
    res_exs['ref_age_category'] = res_exs['ref_age_category_id']
    res_exs['ref_train_part'] = res_exs['ref_train_part_id']
    res_exs['ref_cognitive_load'] = res_exs['ref_cognitive_load_id']
    res_exs = get_exs_video_data2(res_exs, c_exs[0], folder_type, request.user.club_id)
    if is_as_object:
        return res_exs
    else:
        return JsonResponse({"data": res_exs, "success": True}, status=200)


def GET_get_exs_graphic_content(request, cur_user, cur_team):
    """
    Return JSON Response as result on GET operation "Get graphic content of exercise".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]]

    """
    exs_id = -1
    folder_type = request.GET.get("f_type", "")
    try:
        exs_id = int(request.GET.get("exs", -1))
    except:
        pass
    res_exs = {}
    c_exs = None
    if folder_type == FOLDER_TEAM:
        if not util_check_access(cur_user, {
            'perms_user': ["exercises.view_userexercise"], 
            'perms_club': ["exercises.view_clubexercise"]
        }):
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        if request.user.club_id is not None:
            c_exs = ClubExercise.objects.filter(id=exs_id, visible=True, club=request.user.club_id, team=cur_team)
        else:
            c_exs = UserExercise.objects.filter(id=exs_id, visible=True, user=cur_user)
        if c_exs.exists() and c_exs[0].id != None:
            res_exs = c_exs.values()[0]
    elif folder_type == FOLDER_NFB:
        c_exs = AdminExercise.objects.filter(id=exs_id, visible=True)
        if c_exs.exists() and c_exs[0].id != None:
            res_exs = c_exs.values()[0]
    elif folder_type == FOLDER_CLUB:
        if request.user.club_id is not None:
            if not util_check_access(cur_user, {
                'perms_club': ["exercises.view_clubexercise"]
            }):
                return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        c_exs = ClubExercise.objects.filter(id=exs_id, visible=True, club=request.user.club_id)
        if c_exs.exists() and c_exs[0].id != None:
            res_exs = c_exs.values()[0]
    else:
        return JsonResponse({"errors": "Exercise not found.", "success": False}, status=400)
    if c_exs is not None and c_exs.exists() and c_exs[0].id != None:
        res_exs['description'] = get_by_language_code(res_exs['description'], request.LANGUAGE_CODE)
        res_exs['scheme_data'] = get_exs_scheme_data(res_exs['scheme_data'])
        res_exs['video_data'] = get_exs_video_data(res_exs['video_data'])
        res_exs['animation_data'] = get_exs_animation_data(res_exs['animation_data'])
        res_exs = get_exs_video_data2(res_exs, c_exs[0], folder_type, request.user.club_id)
    return JsonResponse({"data": res_exs, "success": True}, status=200)

