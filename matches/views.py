from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.forms.models import model_to_dict

from users.models import User
from references.models import UserTeam, UserSeason, ClubTeam, ClubSeason
from system_icons.views import get_ui_elements
from matches.models import UserMatch, ClubMatch
from nanofootball.views import util_check_access
import matches.v_api as v_api
from datetime import datetime



def matches(request):
    """
    Return render page with given template. 
        If the user is not authorized, then there will be a redirect to the page with authorization.
    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :return: Return an HttpResponse whose content is filled with the result of calling django.template.loader.render_to_string() with the passed arguments.
    Next arguments:\n
    * 'matches' -> Matches objects filtered by user.
    * 'refs' -> References of Matches Section.
    * 'menu_matches' -> Html tag class: "active" for Sidebar.
    * 'seasons_list' -> List of user's or club's seasons available current user.
    * 'teams_list' -> List of user's or club's teams available current user.
    * 'ui_elements' -> List of UI elements registered in icons' system. Check Module.system_icons.views.get_ui_elements(request) for see more.
    :rtype: [HttpResponse]

    """
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    cur_user = User.objects.filter(email=request.user).only("club_id")
    if not util_check_access(cur_user[0], 
        {'perms_user': ["matches.view_usermatch"], 'perms_club': ["matches.view_clubmatch"]}
    ):
        return redirect("users:profile")
    cur_team = -1
    cur_season = -1
    try:
        cur_team = int(request.session['team'])
    except:
        pass
    try:
        cur_season = int(request.session['season'])
    except:
        pass
    matches = []
    f_season = None
    if request.user.club_id is not None:
        f_season = ClubSeason.objects.get(id=cur_season, club_id=request.user.club_id)
    else:
        f_season = UserSeason.objects.get(id=cur_season, user_id=cur_user[0])
    if f_season and f_season.id != None:
        if request.user.club_id is not None:
            f_matches = ClubMatch.objects.filter(team_id=cur_team, event_id__club_id=request.user.club_id,
                event_id__date__range=[
                    datetime.combine(f_season.date_with, datetime.min.time()),
                    datetime.combine(f_season.date_by, datetime.max.time())
                ],
            )
        else:
            f_matches = UserMatch.objects.filter(team_id=cur_team, event_id__user_id=cur_user[0],
                event_id__date__range=[
                    datetime.combine(f_season.date_with, datetime.min.time()),
                    datetime.combine(f_season.date_by, datetime.max.time())
                ],
            )
        for match in f_matches:
            match_obj = model_to_dict(match)
            match_obj['team_name'] = match.team_id.name
            match_obj['date_timestamp'] = v_api.get_date_timestamp_from_datetime(match.event_id.date)
            match_obj['date'] = v_api.get_date_str_from_datetime(match.event_id.date, request.LANGUAGE_CODE)
            match_obj['date_day'] = v_api.get_day_from_datetime(match.event_id.date, request.LANGUAGE_CODE)
            match_obj['date_time'] = v_api.get_time_from_datetime(match.event_id.date)
            match_res = v_api.get_match_result(match_obj)
            match_obj['result'] = match_res[0]
            match_obj['goals_equal'] = match_res[1]
            match_obj['duration'] = v_api.get_duration_normal_format(match.duration)
            match_obj['goals'] = match.goals if (match.goals != 0 or match.o_goals != 0) else '-'
            match_obj['o_goals'] = match.o_goals if (match.goals != 0 or match.o_goals != 0) else '-'
            match_obj['penalty'] = match.penalty if (match.penalty != 0 or match.o_penalty != 0) else '-'
            match_obj['o_penalty'] = match.o_penalty if (match.penalty != 0 or match.o_penalty != 0) else '-'
            match_videos = v_api.GET_get_match_video_event(request, cur_user[0], cur_team, False, match.event_id.id)
            match_obj['videos_count'] = v_api.count_videos(match_videos)
            matches.append(match_obj)
    refs = {}
    refs = v_api.get_matches_refs(request)
    return render(request, 'matches/base_matches.html', {
        'matches': matches,
        'refs': refs,
        'menu_matches': 'active',
        'seasons_list': request.seasons_list,
        'teams_list': request.teams_list,
        'ui_elements': get_ui_elements(request)
    })


def match(request):
    """
    Return render page with given template. 
        If the user is not authorized, then there will be a redirect to the page with authorization.
    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :return: Return an HttpResponse whose content is filled with the result of calling django.template.loader.render_to_string() with the passed arguments.
    Next arguments:\n
    * 'refs' -> References of Matches Section.
    * 'menu_matches' -> Html tag class: "active" for Sidebar.
    * 'seasons_list' -> List of user's or club's seasons available current user.
    * 'teams_list' -> List of user's or club's teams available current user.
    * 'ui_elements' -> List of UI elements registered in icons' system. Check Module.system_icons.views.get_ui_elements(request) for see more.
    :rtype: [HttpResponse]

    """
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    cur_user = User.objects.filter(email=request.user).only("club_id")
    if not util_check_access(cur_user[0], 
        {'perms_user': ["matches.view_usermatch"], 'perms_club': ["matches.view_clubmatch"]}
    ):
        return redirect("users:profile")
    cur_team = -1
    try:
        cur_team = int(request.session['team'])
    except:
        pass
    match = v_api.GET_get_match(request, cur_user[0], cur_team, False)
    if match == None:
        return redirect("matches:base_matches")
    refs = {}
    refs = v_api.get_matches_refs(request)
    return render(request, 'matches/base_match.html', {
        'refs': refs,
        'menu_matches': 'active',
        'seasons_list': request.seasons_list,
        'teams_list': request.teams_list,
        'ui_elements': get_ui_elements(request)
    })


def matches_api(request):
    """
    Return JsonResponse depending on the request method and the parameter sent. 
        If the user is not authorized, then there will be a redirect to the page with authorization.
        In case of any error client will get next response: JsonResponse({"errors": "access_error"}, status=400).\n
    Existing parameteres (Controlling Variable for any parameter is: 'parameter'_status):\n
    * 'edit_match' -> Edit match including creating new match.
    * 'delete_match' -> Delete match by ID.
    * 'add_players_protocol' -> Add players to match's protocol.
    * 'delete_players_protocol' -> Delete players in match's protocol.
    * 'edit_players_protocol' -> Edit players in match's protocol.
    * 'edit_players_protocol_order' -> Edit players' order in match's protocol.
    * 'edit_match_video_event' -> Edit match's video.
    * 'edit_match_video_protocol' -> Edit match's protocol's video.
    * 'get_match' -> Get one match by ID.
    * 'get_match_protocol' -> Get one match's protocol by match's ID.
    * 'get_match_video_event' -> Get match's video by match's ID.
    * 'get_match_video_protocol' -> Get match's protocol's video by match's ID.
    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :return: Return an JsonResponse with next parameteres:\n
    * 'errors' -> Error text in case getting any error.
    * 'status' -> Response code.
    * 'data' -> Requiered data depending on the request method and the parameter sent, if status code is OK.
    :rtype: [JsonResponse]

    """
    if not request.user.is_authenticated:
        return JsonResponse({"errors": "authenticate_err"}, status=400)
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    if request.method == "POST" and is_ajax:
        edit_match_status = 0
        delete_match_status = 0
        add_players_protocol_status = 0
        delete_players_protocol_status = 0
        edit_players_protocol_status = 0
        edit_players_protocol_order_status = 0
        edit_match_video_event_status = 0
        edit_match_video_protocol_status = 0
        cur_user = User.objects.filter(email=request.user).only("id")
        cur_team = -1
        if not cur_user.exists() or cur_user[0].id == None:
            return JsonResponse({"errors": "trouble_with_user"}, status=400)
        try:
            cur_team = int(request.session['team'])
        except:
            pass
        try:
            edit_match_status = int(request.POST.get("edit_match", 0))
        except:
            pass
        try:
            delete_match_status = int(request.POST.get("delete_match", 0))
        except:
            pass
        try:
            add_players_protocol_status = int(request.POST.get("add_players_protocol", 0))
        except:
            pass
        try:
            delete_players_protocol_status = int(request.POST.get("delete_players_protocol", 0))
        except:
            pass
        try:
            edit_players_protocol_status = int(request.POST.get("edit_players_protocol", 0))
        except:
            pass
        try:
            edit_players_protocol_order_status = int(request.POST.get("edit_players_protocol_order", 0))
        except:
            pass
        try:
            edit_match_video_event_status = int(request.POST.get("edit_match_video_event", 0))
        except:
            pass
        try:
            edit_match_video_protocol_status = int(request.POST.get("edit_match_video_protocol", 0))
        except:
            pass
        if edit_match_status == 1:
            return v_api.POST_edit_match(request, cur_user[0], cur_team)
        elif delete_match_status == 1:
            return v_api.POST_delete_match(request, cur_user[0], cur_team)
        elif add_players_protocol_status == 1:
            return v_api.POST_add_delete_players_protocol(request, cur_user[0], True)
        elif delete_players_protocol_status == 1:
            return v_api.POST_add_delete_players_protocol(request, cur_user[0], False)
        elif edit_players_protocol_status == 1:
            return v_api.POST_edit_players_protocol(request, cur_user[0])
        elif edit_players_protocol_order_status == 1:
            return v_api.POST_edit_players_protocol_order(request, cur_user[0])
        elif edit_match_video_event_status == 1:
            return v_api.POST_edit_match_video_event(request, cur_user[0], cur_team)
        elif edit_match_video_protocol_status == 1:
            return v_api.POST_edit_match_video_protocol(request, cur_user[0], cur_team)
        return JsonResponse({"errors": "access_error"}, status=400)
    elif request.method == "GET" and is_ajax:
        get_match_status = 0
        get_match_protocol_status = 0
        get_match_video_event_status = 0
        get_match_video_protocol_status = 0
        cur_user = User.objects.filter(email=request.user).only("id")
        cur_team = -1
        if not cur_user.exists() or cur_user[0].id == None:
            return JsonResponse({"errors": "trouble_with_user"}, status=400)
        try:
            cur_team = int(request.session['team'])
        except:
            pass
        try:
            get_match_status = int(request.GET.get("get_match", 0))
        except:
            pass
        try:
            get_match_protocol_status = int(request.GET.get("get_match_protocol", 0))
        except:
            pass
        try:
            get_match_video_event_status = int(request.GET.get("get_match_video_event", 0))
        except:
            pass
        try:
            get_match_video_protocol_status = int(request.GET.get("get_match_video_protocol", 0))
        except:
            pass
        if get_match_status == 1:
            return v_api.GET_get_match(request, cur_user[0], cur_team)
        elif get_match_protocol_status == 1:
            return v_api.GET_get_match_protocol(request, cur_user[0], cur_team)
        elif get_match_video_event_status == 1:
            return v_api.GET_get_match_video_event(request, cur_user[0], cur_team)
        elif get_match_video_protocol_status == 1:
            return v_api.GET_get_match_video_protocol(request, cur_user[0], cur_team)
        return JsonResponse({"errors": "access_error"}, status=400)
    else:
        return JsonResponse({"errors": "access_error"}, status=400)

