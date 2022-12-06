from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authtoken.models import Token
from api.models import APIToken
from users.models import User
import exercises.v_api as exercises_v_api



def check_token(get_token):
    """
    Return User if token for this user is corrected.

    :param get_token: string token is sent by user in GET request as parameter "token".
    :type get_token: [str]
    :return: User if token found, else False.
    :rtype: [User] or False

    """
    f_user = False
    users_with_api = User.objects.filter(is_api_access=True).only("club_id")
    if users_with_api.exists() and users_with_api[0].id != None:
        for user in users_with_api:
            token, created = Token.objects.get_or_create(user=user)
            api_token, created = APIToken.objects.update_or_create(user=user, defaults={"token": token.key})
        found_api_token = APIToken.objects.filter(token=get_token)
        if found_api_token.exists() and found_api_token[0].id != None:
            f_user = found_api_token[0].user
    return f_user



@csrf_exempt
@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def exercises(request):
    """
    Return JsonResponse depending on the parameter sent. Can get data without authentication and permission. Only GET requests.
    Check exercises.v_api for more information.
    Existing parameteres (Controlling Variable for any parameter is: 'parameter'_status):\n
    * 'get_exs_all' -> Get all exercises in selected folder.
    * 'get_exs_one' -> Get exercise by ID.
    * 'get_link_video_exs' -> Update exercises.ExerciseVideo using video_data and anim_data in Exercise (useful after parsing).
    
    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :return: Return an JsonResponse with next parameteres:\n
    * 'errors' -> Error text in case getting any error.
    * 'status' -> Response code.
    * 'data' -> Requiered data depending on the request method and the parameter sent, if status code is OK.
    :rtype: [JsonResponse]

    """
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    token = request.data.get('token', "")
    cur_user = check_token(token)
    if not cur_user or not is_ajax:
        return JsonResponse({"err": "Access denied!"}, status=400)
    request.GET = request.data
    get_exs_all_status = 0
    get_exs_one_status = 0
    get_link_video_exs_status = 0
    try:
        get_exs_all_status = int(request.GET.get("get_exs_all", 0))
    except:
        pass
    try:
        get_exs_one_status = int(request.GET.get("get_exs_one", 0))
    except:
        pass
    try:
        get_link_video_exs_status = int(request.GET.get("get_link_video_exs", 0))
    except:
        pass
    if get_exs_all_status == 1:
        return exercises_v_api.GET_get_exs_all(request, cur_user)
    elif get_exs_one_status == 1:
        cur_team = -1
        try:
            cur_team = int(request.GET.get('team', -1))
        except:
            pass
        return exercises_v_api.GET_get_exs_one(request, cur_user, cur_team)
    elif get_link_video_exs_status:
        return exercises_v_api.GET_link_video_exs(request, cur_user)
    return JsonResponse({"err": "Access denied!"}, status=400)

