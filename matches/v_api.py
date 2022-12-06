from django.http import JsonResponse
from django.forms.models import model_to_dict
import json
import re
from datetime import datetime, date, timedelta
from references.models import UserTeam, ClubTeam
from events.models import UserEvent, ClubEvent, EventVideoLink
from matches.models import UserMatch, ClubMatch, UserProtocol, ClubProtocol
from references.models import PlayerProtocolStatus
from players.models import UserPlayer, ClubPlayer
from nanofootball.views import util_check_access


LANG_CODE_DEFAULT = "en"

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


def set_value_as_int(value, def_value = None):
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
        res = int(value)
    except:
        pass
    return res


def set_value_as_datetime(value):
    """
    Return Date or None. Transforming value to date using format "ddmmyyyy" or "yyyymmdd".

    :param value: Date string.
    :type value: [str]
    :return: Date or None.
    :rtype: [date] or None

    """
    format_ddmmyyyy = "%d/%m/%Y %H:%M:%S"
    format_yyyymmdd = "%Y-%m-%d %H:%M:%S"
    date1 = None
    date2 = None
    try:
        date1 = datetime.strptime(value, format_ddmmyyyy)
    except:
        pass
    try:
        date2 = datetime.strptime(value, format_yyyymmdd)
    except:
        pass
    if date1:
        value = date1
    elif date2:
        value = date2
    else:
        value = None
    return value   


def set_value_as_duration(value, only_mins=True):
    """
    Return Timedelta. Transforming value to timeDelta.

    :param value: Date string.
    :type value: [str]
    :param only_mins: If only minutes then time will be created using only minutes. Example: True -> "20", False -> "10:20:10"
    :type only_mins: [bool]
    :return: Timedelta.
    :rtype: [timedelta]

    """
    if not only_mins:
        m = re.match(r'(?P<h>\d+):(?P<m>\d+):'r'(?P<s>\d[\.\d+]*)', value)
        if not m:
            return timedelta()
        time_dict = {key: float(val) for key, val in m.groupdict().items()}
    else:
        mins_val = 0
        try:
            mins_val = int(value)
        except:
            pass
        time_dict = {'h': 0, 'm': mins_val, 's': 0}
    return timedelta(hours=time_dict['h'], minutes=time_dict['m'], seconds=time_dict['s'])


def get_date_str_from_datetime(datetime_obj, code):
    """
    Return Date string or None. For different languages different date's formats.

    :param datetime_obj: Datetime object.
    :type datetime_obj: [datetime]
    :param code: String key of any language. For example: "engilsh" -> "en", "russian" -> "ru".
    :type code: [str]
    :return: Date string or None.
    :rtype: [str] or None

    """
    formats = {
        'en': "%Y-%m-%d",
        'ru': "%d/%m/%Y"
    }
    date_str = ""
    try:
        date_str = datetime_obj.strftime(formats[code])
    except:
        return None
    return date_str


def get_date_timestamp_from_datetime(datetime_obj):
    """
    Return Date's timestamp or None.

    :param datetime_obj: Datetime object.
    :type datetime_obj: [datetime]
    :return: Date's timestamp or None.
    :rtype: [int] or None

    """
    try:
        return datetime_obj.timestamp()
    except:
        return None


def get_day_from_datetime(datetime_obj, code):
    """
    Return Day of date string or None.

    :param datetime_obj: Datetime object.
    :type datetime_obj: [datetime]
    :param code: String key of any language. For example: "engilsh" -> "en", "russian" -> "ru".
    :type code: [str]
    :return: Day string or None.
    :rtype: [str] or None

    """
    days = {
        'ru': ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"],
        'en': ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    }
    day = None
    try:
        day = days[code][datetime_obj.weekday()]
    except:
        pass
    return day


def get_time_from_datetime(datetime_obj):
    """
    Return time string of datetime as "Hour:Minutes".

    :param datetime_obj: Datetime object.
    :type datetime_obj: [datetime]
    :return: Time string or None.
    :rtype: [str] or None

    """
    time_str = None
    try:
        time_str = datetime_obj.strftime("%H:%M")
    except:
        pass
    return time_str


def get_duration_normal_format(timedelta_obj, only_mins=True):
    """
    Return duration of datetime as string.

    :param timedelta_obj: Datetime object.
    :type timedelta_obj: [datetime]
    :param only_mins: If only minutes then duration will be created using only minutes. Example: True -> "20", False -> "10:20:10"
    :type only_mins: [bool]
    :return: Duration string of datetime object or None.
    :rtype: [str] or None

    """
    duration_str = None
    if not only_mins:
        try:
            t_arr = str(timedelta_obj).split(':')
            duration_str = "{:02}:{:02}:{:02}".format(int(t_arr[0]), int(t_arr[1]), int(t_arr[2]))
        except:
            pass
    else:
        try:
            mins_v = round(timedelta_obj.total_seconds() / 60)
            duration_str = f"{mins_v}"
        except:
            pass
    return duration_str


def get_match_result(data):
    """
    Return list of two elements for defining match's result. 
    First element:
    = 0 -> Draw
    = 1 -> First team's win.
    = 2 -> Second team's win.
    = -1 -> Any error.
    Second element:
    = 1 -> The number of goals is equal.
    = 0 -> The number of goals is not equal.
    = -1 -> Any error.
    
    :param data: Match's object.
    :type data: [object]
    :return: List of two elements - statuses match's result.
    :rtype: list[int]

    """
    # первый элемент - 0:Ничья, 1:Победа_1-ой_команды, 2:Победа_2-ой.
    # Второй элемент - 1: кол-во голов равно, 0:не равно.
    res = [-1, -1]
    try:
        if data['goals'] > data['o_goals']:
            res = [1, 0]
        elif data['goals'] < data['o_goals']:
            res = [2, 0]
        else:
            if data['penalty'] > data['o_penalty']:
                res = [1, 1]
            elif data['penalty'] < data['o_penalty']:
                res = [2, 1]
            else:
                res = [0, 1]
    except:
        pass
    return res


def get_protocol_status(request, elem):
    """
    Return dictionary with full protocol name and short.
    
    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param elem: status's object.
    :type elem: [object]
    :return: Dictionary with full protocol name and short.
    :rtype: dict['full':[str], 'short':[str]]

    """
    res = {'full': "", 'short': ""}
    if elem and elem.translation_names:
        if elem.translation_names[request.LANGUAGE_CODE]:
            res["full"] = elem.translation_names[request.LANGUAGE_CODE]
        else:
            res["full"] = elem.translation_names[request.LANG_CODE_DEFAULT]
    if elem and elem.short_name:
        res["short"] = elem.short_name
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


def get_matches_refs(request):
    """
    Return data of Matches' References with translations.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :return: Dictionary of references.
    :rtype: dict[list[object]]

    """
    refs = {}
    refs['player_protocol_status'] = PlayerProtocolStatus.objects.filter(tags__matches=1).values()
    for elem in refs['player_protocol_status']:
        elem['is_red'] = "matches_red" in elem['tags'] and elem['tags']['matches_red'] == 1
    refs = set_refs_translations(refs, request.LANGUAGE_CODE)
    return refs


def count_videos(data):
    """
    Return amount of videos at data. Data is usually match object.

    :param data: Match object.
    :type data: [object]
    :return: Amount of videos.
    :rtype: [int]

    """
    counter = 0
    if data and data['links'] and isinstance(data['links'], list):
        for elem in data['links']:
            if elem != "":
                counter += 1
    return counter



# --------------------------------------------------
# MATCHES API
def POST_edit_match(request, cur_user, cur_team):
    """
    Return JSON Response as result on POST operation "Edit match".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    match_id = -1
    try:
        match_id = int(request.POST.get("id", -1))
    except:
        pass
    c_match = None
    c_team = None
    if not util_check_access(cur_user, {
        'perms_user': ["matches.change_usermatch", "matches.add_usermatch"], 
        'perms_club': ["matches.change_clubmatch", "matches.add_clubmatch"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    post_data = request.POST.get("data", None)
    try:
        post_data = json.loads(post_data)
    except:
        post_data = None
    if not post_data:
        return JsonResponse({"errors": "Can't parse post data"}, status=400)
    adding_mode = False
    c_datetime = set_value_as_datetime(f"{post_data['date']} {post_data['time']}:00")
    c_match = None
    if request.user.club_id is not None:
        c_match = ClubMatch.objects.filter(event_id=match_id, team_id=cur_team)
        if not c_match.exists() or c_match[0].event_id == None:
            adding_mode = True
            c_team = ClubTeam.objects.filter(id=cur_team)
            if not c_team.exists() or c_team[0].id == None:
                return JsonResponse({"err": "Team not found.", "success": False}, status=400)
            try:
                if c_datetime:
                    new_event = ClubEvent(user_id=cur_user, date=c_datetime, club_id=request.user.club_id)
                else:
                    new_event = ClubEvent(user_id=cur_user, club_id=request.user.club_id)
                new_event.save()
            except:
                return JsonResponse({"errors": "Can't create event"}, status=400)
            c_match = ClubMatch(team_id=c_team[0], event_id=new_event)
        else:
            c_match = c_match[0]
    else:
        c_match = UserMatch.objects.filter(event_id=match_id, team_id=cur_team)
        if not c_match.exists() or c_match[0].event_id == None:
            adding_mode = True
            c_team = UserTeam.objects.filter(id=cur_team)
            if not c_team.exists() or c_team[0].id == None:
                return JsonResponse({"err": "Team not found.", "success": False}, status=400)
            try:
                if c_datetime:
                    new_event = UserEvent(user_id=cur_user, date=c_datetime)
                else:
                    new_event = UserEvent(user_id=cur_user)
                new_event.save()
            except:
                return JsonResponse({"errors": "Can't create event"}, status=400)
            c_match = UserMatch(team_id=c_team[0], event_id=new_event)
        else:
            c_match = c_match[0]
    if c_match == None:
        return JsonResponse({"err": "Match not found.", "success": False}, status=400)
    if c_datetime:
        c_match.event_id.date = c_datetime
    c_match.duration = set_value_as_duration(post_data['duration'])
    c_match.goals = set_value_as_int(post_data['goals'], 0)
    c_match.penalty = set_value_as_int(post_data['penalty'], 0)
    c_match.opponent = post_data['opponent_name']
    c_match.o_goals = set_value_as_int(post_data['o_goals'], 0)
    c_match.o_penalty = set_value_as_int(post_data['o_penalty'], 0)
    c_match.place = post_data['place']
    c_match.tournament = post_data['tournament']
    c_match.m_type = set_value_as_int(post_data['m_type'], 0)
    c_match.m_format = post_data['m_format']
    try:
        c_match.save()
        res_data = f'Match with id: [{c_match.event_id}] is added / edited successfully.'
    except Exception as e:
        return JsonResponse({"err": "Can't edit or add the match.", "success": False}, status=200)
    return JsonResponse({"data": res_data, "success": True}, status=200)


def POST_delete_match(request, cur_user, cur_team):
    """
    Return JSON Response as result on POST operation "Delete match".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    match_id = -1
    try:
        match_id = int(request.POST.get("id", -1))
    except:
        pass
    c_event = None # deleting the event, delete and match
    if not util_check_access(cur_user, {
        'perms_user': ["matches.delete_usermatch"], 
        'perms_club': ["matches.delete_clubmatch"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    if request.user.club_id is not None:
        c_event = ClubEvent.objects.filter(id=match_id, club_id=request.user.club_id)
    else:
        c_event = UserEvent.objects.filter(id=match_id, user_id=cur_user)
    if c_event == None or not c_event.exists() or c_event[0].id == None:
        return JsonResponse({"errors": "access_error"}, status=400)
    else:
        try:
            c_event.delete()
            return JsonResponse({"data": {"id": match_id}, "success": True}, status=200)
        except:
            return JsonResponse({"errors": "Can't delete exercise"}, status=400)


def POST_edit_players_protocol(request, cur_user):
    """
    Return JSON Response as result on POST operation "Edit players' protocol in match".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    protocol_id = -1
    c_value = None
    try:
        protocol_id = int(request.POST.get("protocol_id", -1))
    except:
        pass
    try:
        c_value = int(request.POST.get("value", None))
    except:
        pass
    c_key = request.POST.get("key", "")
    keys_with_values = ['minute_from', 'minute_to', 'goal', 'penalty', 'p_pass', 'yellow_card', 'red_card', 'estimation', 'like', 'dislike']
    AnyProtocol = None
    if request.user.club_id is not None:
        AnyProtocol = ClubProtocol
    else:
        AnyProtocol = UserProtocol
    try:
        update_dict = {
            f'{c_key}': c_value
        }
        if c_key in keys_with_values:
            f_protocol = AnyProtocol.objects.filter(id=protocol_id)
            if f_protocol.exists() and f_protocol[0].id != None:
                if f_protocol[0].p_status and 'matches_reset' in f_protocol[0].p_status.tags and f_protocol[0].p_status.tags['matches_reset'] == 1:
                    c_value = None
                    if c_key == "dislike" or c_key == "like":
                        c_value = False
            if c_value and c_value < 0:
                c_value = None
            update_dict[c_key] = c_value
            if c_key == "dislike" and c_value == 1:
                update_dict['like'] = 0
            elif c_key == "like" and c_value == 1:
                update_dict['dislike'] = 0
        elif c_key == "status":
            c_status_id = -1
            try:
                c_status_id = int(c_value)
            except:
                pass
            f_status = PlayerProtocolStatus.objects.filter(id=c_status_id, tags__matches=1)
            is_reset_values = False
            if f_status.exists() and f_status[0].id != None:
                is_reset_values = 'matches_reset' in f_status[0].tags and f_status[0].tags['matches_reset'] == 1
                update_dict = {'p_status': f_status[0].id}
            else:
                update_dict = {'p_status': None}
            if is_reset_values:
                for t_key in keys_with_values:
                    if t_key != "dislike" and t_key != "like":
                        update_dict[t_key] = None
                    else:
                        update_dict[t_key] = False
        elif c_key == "is_captain" or c_key == "is_goalkeeper":
            f_protocol = AnyProtocol.objects.filter(id=protocol_id)
            if f_protocol.exists() and f_protocol[0].id != None:
                t_val = getattr(f_protocol[0], c_key)
                update_dict[c_key] = not t_val
        elif c_key == "border_black" or c_key == "border_red":
            f_protocol = AnyProtocol.objects.filter(id=protocol_id)
            if f_protocol.exists() and f_protocol[0].id != None:
                t_val = getattr(f_protocol[0], c_key)
                t_val = 1 if t_val == 0 else 0
                update_dict[c_key] = t_val
        AnyProtocol.objects.filter(id=protocol_id).update(**update_dict)
    except Exception as e:
        print(e)
        return JsonResponse({"err": "Can't edit match protocol.", "success": False}, status=400)
    return JsonResponse({"data": update_dict, "success": True}, status=200)


def POST_add_delete_players_protocol(request, cur_user, to_add = True):
    """
    Return JSON Response as result on POST operation "Add or delete players' protocol in match".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param to_add: If true then add new protocol else delete existed by ID.
    :type to_add: [bool]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    match_id = -1
    team_id = -1
    is_opponent = 0
    try:
        match_id = int(request.POST.get("match_id", -1))
    except:
        pass
    try:
        team_id = int(request.POST.get("team_id", -1))
    except:
        pass
    try:
        is_opponent = int(request.POST.get("is_opponent", 0))
    except:
        pass
    post_data = request.POST.get("data", None)
    try:
        post_data = json.loads(post_data)
    except:
        post_data = None
    if not post_data:
        return JsonResponse({"errors": "Can't parse post data"}, status=400)
    res_data = []
    for pl_id_str in post_data:
        pl_id = None
        try:
            pl_id = int(pl_id_str)
        except:
            pass
        if not pl_id:
            continue
        if to_add:
            f_player = None
            f_match = None
            if request.user.club_id is not None:
                f_player = ClubPlayer.objects.filter(id=pl_id, team=team_id)
                f_match = ClubMatch.objects.filter(event_id=match_id)
            else:
                f_player = UserPlayer.objects.filter(id=pl_id, user=cur_user, team=team_id)
                f_match = UserMatch.objects.filter(event_id=match_id)
            if f_player.exists() and f_player[0].id != None and f_match.exists() and f_match[0].event_id != None:
                protocol = None
                created = False
                if request.user.club_id is not None:
                    protocol, created = ClubProtocol.objects.get_or_create(match=f_match[0], player=f_player[0])
                else:
                    protocol, created = UserProtocol.objects.get_or_create(match=f_match[0], player=f_player[0])
                if created:
                    try:
                        protocol.is_opponent = is_opponent
                        protocol.save()
                        res_data.append(f"Created new protocol with id: {protocol.id}")
                    except:
                        pass
                else:
                    res_data.append(f"Protocol with id: {protocol.id} (refer on player: {f_player[0].id} and on match: {f_match[0].event_id}) already existed.")
        else:
            f_protocol = None
            if request.user.club_id is not None:
                f_protocol = ClubProtocol.objects.filter(id=pl_id)
            else:
                f_protocol = UserProtocol.objects.filter(id=pl_id)
            if f_protocol != None and f_protocol.exists() and f_protocol[0].id != None:
                try:
                    f_protocol[0].delete()
                    res_data.append(f"Protocol was deleted.")
                except:
                    res_data.append(f"Protocol couldnt delete.")
            else:
                res_data.append(f"Protocol not found for delete.")
    is_success = True
    status = 200
    if len(res_data) == 0:
        is_success = False
        status = 400
        res_data = "RESULT IS EMPTY."
    return JsonResponse({"data": res_data, "success": is_success}, status=status)


def POST_edit_players_protocol_order(request, cur_user):
    """
    Return JSON Response as result on POST operation "Edit ordering of players' protocols in match".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    ids_data = request.POST.getlist("protocols[]", [])
    temp_res_arr = []
    for c_ind in range(len(ids_data)):
        t_id = -1
        t_order = c_ind + 1
        try:
            t_id = int(ids_data[c_ind])
        except:
            pass
        found_protocol = None
        if request.user.club_id is not None:
            found_protocol = ClubProtocol.objects.get(id=t_id)
        else:
            found_protocol = UserProtocol.objects.get(id=t_id)
        if found_protocol and found_protocol.id != None:
            found_protocol.order = t_order
            try:
                found_protocol.save()
                temp_res_arr.append(f'Folder [{found_protocol.id}] is order changed: {t_order}')
            except Exception as e:
                temp_res_arr.append(f'Folder [{found_protocol.id}] -> ERROR / Not access or another reason')
    res_data = {'res_arr': temp_res_arr, 'type': "change_order"}
    return JsonResponse({"data": res_data, "success": True}, status=200)


def POST_edit_match_video_event(request, cur_user, cur_team):
    """
    Return JSON Response as result on POST operation "Edit match's video event".
    Match is event, every event has video links' field. This function is allowed to edit these links.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    links_data = request.POST.getlist("links[]", [])
    notes_data = request.POST.getlist("notes[]", [])
    event_id = -1
    try:
        event_id = int(request.POST.get("id", -1))
    except:
        pass
    res_data = "ERROR."
    success_state = False
    status_state = 400
    f_event = None
    if request.user.club_id is not None:
        f_event = ClubEvent.objects.filter(id=event_id)
    else:
        f_event = UserEvent.objects.filter(id=event_id)
    if f_event != None and f_event.exists() and f_event[0].id != None:
        f_event_video = f_event[0].video_link
        if f_event_video == None:
            f_event_video = EventVideoLink()
        f_event_video.json_link = links_data
        f_event_video.description = notes_data
        try:
            f_event_video.save()
            f_event = f_event[0]
            f_event.video_link = f_event_video
            f_event.save()
            success_state = True
            status_state = 200
            res_data = f"Event with video was saved: {f_event.id}."
        except Exception as e:
            print(e)
            res_data = f"Event with video not saved: {f_event.id}"
            pass
    return JsonResponse({"data": res_data, "success": success_state}, status=status_state)


def POST_edit_match_video_protocol(request, cur_user, cur_team):
    """
    Return JSON Response as result on POST operation "Edit match's video event".
    Every player's protocol in match has field video_link also. This foreign key at the same Model(EventVideoLink) how for event.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    links_data = request.POST.getlist("links[]", [])
    notes_data = request.POST.getlist("notes[]", [])
    protocol_id = -1
    try:
        protocol_id = int(request.POST.get("id", -1))
    except:
        pass
    res_data = "ERROR."
    success_state = False
    status_state = 400
    f_protocol = None
    if request.user.club_id is not None:
        f_protocol = ClubProtocol.objects.filter(id=protocol_id)
    else:
        f_protocol = UserProtocol.objects.filter(id=protocol_id)
    if f_protocol.exists() and f_protocol[0].id != None:
        f_protocol_video = f_protocol[0].video_link
        if f_protocol_video == None:
            f_protocol_video = EventVideoLink()
        f_protocol_video.json_link = links_data
        f_protocol_video.description = notes_data
        try:
            f_protocol_video.save()
            f_protocol = f_protocol[0]
            f_protocol.video_link = f_protocol_video
            f_protocol.save()
            success_state = True
            status_state = 200
            res_data = f"Event with video was saved: {f_protocol.id}."
        except Exception as e:
            print(e)
            res_data = f"Event with video not saved: {f_protocol.id}"
            pass
    return JsonResponse({"data": res_data, "success": success_state}, status=status_state)




def GET_get_match(request, cur_user, cur_team, return_JsonResponse=True):
    """
    Return JSON Response or object as result on GET operation "Get one match".
    If return_JsonResponse is False then function return Object
    else JSON Response.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :param return_JsonResponse: Controls returning type.
    :type return_JsonResponse: [bool]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code) or as match's object.
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]] or Object

    """
    match_id = -1
    try:
        match_id = int(request.GET.get("id", -1))
    except:
        pass
    res_data = {}
    match = None
    if not util_check_access(cur_user, {
        'perms_user': ["matches.view_usermatch"], 
        'perms_club': ["matches.view_clubmatch"]
    }):
        if return_JsonResponse:
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        else:
            return None
    if request.user.club_id is not None:
        match = ClubMatch.objects.filter(event_id=match_id, team_id=cur_team)
    else:
        match = UserMatch.objects.filter(event_id=match_id, team_id=cur_team)
    if match.exists() and match[0].event_id != None:
        res_data = match.values()[0]
        res_data['date'] = get_date_str_from_datetime(match[0].event_id.date, LANG_CODE_DEFAULT)
        res_data['time'] = get_time_from_datetime(match[0].event_id.date)
        res_data['duration'] = get_duration_normal_format(match[0].duration)
        res_data['team_name'] = match[0].team_id.name
        res_data['opponent_name'] = match[0].opponent
        match_res = get_match_result(res_data)
        res_data['result'] = match_res[0]
        match_videos = GET_get_match_video_event(request, cur_user, cur_team, False, match[0].event_id.id)
        res_data['videos_count'] = count_videos(match_videos)
        if return_JsonResponse:
            return JsonResponse({"data": res_data, "success": True}, status=200)
        else:
            return res_data
    if return_JsonResponse:
        return JsonResponse({"errors": "Match not found.", "success": False}, status=400)
    else:
        return None


def GET_get_match_protocol(request, cur_user, cur_team):
    """
    Return JSON Response or object as result on GET operation "Get protocol of selected match".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    match_id = -1
    try:
        match_id = int(request.GET.get("id", -1))
    except:
        pass
    res_data = []
    protocol = None
    if request.user.club_id is not None:
        protocol = ClubProtocol.objects.filter(match=match_id)
    else:
        protocol = UserProtocol.objects.filter(match=match_id)
    if protocol.exists() and protocol[0].id != None:
        for protocol_elem in protocol:
            protocol_dict = model_to_dict(protocol_elem)
            protocol_dict['player_name'] = f"{protocol_elem.player.surname} {protocol_elem.player.name}"
            protocol_dict['player_name_full'] = f"{protocol_elem.player.surname} {protocol_elem.player.name} {protocol_elem.player.patronymic}"
            tmp_status = get_protocol_status(request, protocol_elem.p_status)
            protocol_dict['status_full'] = tmp_status['full']
            protocol_dict['status_short'] = tmp_status['short']
            protocol_dict['status_red'] = 1 if protocol_elem.p_status and 'matches_red' in protocol_elem.p_status.tags and protocol_elem.p_status.tags['matches_red'] == 1 else 0
            protocol_videos = GET_get_match_video_protocol(request, cur_user, cur_team, False, protocol_elem.id)
            protocol_dict['videos_count'] = count_videos(protocol_videos)
            res_data.append(protocol_dict)
        return JsonResponse({"data": res_data, "success": True}, status=200)
    return JsonResponse({"errors": "Match protocol not found.", "success": False}, status=400)


def GET_get_match_video_event(request, cur_user, cur_team, returnJSONResponse=True, custom_id=None):
    """
    Return JSON Response or object as result on GET operation "Get one match's video event".
    If return_JsonResponse is False then function return Object or None
    else JSON Response.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :param returnJSONResponse: Controls returning type.
    :type returnJSONResponse: [bool]
    :param custom_id: Custom event's ID.
    :type custom_id: [int] or None
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code) or as video_event's object.
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]] or Object or None

    """
    event_id = -1
    try:
        event_id = int(request.GET.get("id", -1))
    except:
        pass
    if custom_id:
        event_id = custom_id
    event = None
    if request.user.club_id is not None:
        event = ClubEvent.objects.filter(id=event_id)
    else:
        event = UserEvent.objects.filter(id=event_id)
    if event.exists() and event[0].id != None:
        res_data = {'links': [], 'notes': []}
        try:
            res_data["links"] = event[0].video_link.json_link
            res_data["notes"] = event[0].video_link.description
        except:
            pass
        if returnJSONResponse:
            return JsonResponse({"data": res_data, "success": True}, status=200)
        else:
            return res_data
    if returnJSONResponse:
        return JsonResponse({"errors": "Event video not found.", "success": False}, status=400)
    else:
        return None


def GET_get_match_video_protocol(request, cur_user, cur_team, returnJSONResponse=True, custom_id=None):
    """
    Return JSON Response or object as result on GET operation "Get one match's protocol video".
    If return_JsonResponse is False then function return Object or None
    else JSON Response.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :param returnJSONResponse: Controls returning type.
    :type returnJSONResponse: [bool]
    :param custom_id: Custom protocol's ID.
    :type custom_id: [int] or None
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code) or as video_protocol's object.
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]] or Object or None

    """
    protocol_id = -1
    try:
        protocol_id = int(request.GET.get("id", -1))
    except:
        pass
    if custom_id:
        protocol_id = custom_id
    protocol = None
    if request.user.club_id is not None:
        protocol = ClubProtocol.objects.filter(id=protocol_id)
    else:
        protocol = UserProtocol.objects.filter(id=protocol_id)
    if protocol.exists() and protocol[0].id != None:
        res_data = {'links': [], 'notes': []}
        try:
            res_data["links"] = protocol[0].video_link.json_link
            res_data["notes"] = protocol[0].video_link.description
        except:
            pass
        if returnJSONResponse:
            return JsonResponse({"data": res_data, "success": True}, status=200)
        else:
            return res_data
    if returnJSONResponse:
        return JsonResponse({"errors": "Protocol video not found.", "success": False}, status=400)
    else:
        return None

