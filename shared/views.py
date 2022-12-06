from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, authentication_classes, permission_classes
import shared.v_api as v_api
from users.models import User



def shared_link_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({"errors": "authenticate_err"}, status=400)
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    if request.method == "POST" and is_ajax:
        add_link_status = 0
        cur_user = User.objects.filter(email=request.user).only("id")
        if not cur_user.exists() or cur_user[0].id == None:
            return JsonResponse({"errors": "trouble_with_user"}, status=400)
        try:
            add_link_status = int(request.POST.get("add_link", 0))
        except:
            pass
        if add_link_status == 1:
            return v_api.POST_add_link(request, cur_user[0])
        return JsonResponse({"errors": "access_error"}, status=400)
    elif request.method == "GET" and is_ajax:
        get_link_status = 0
        cur_user = User.objects.filter(email=request.user).only("id")
        if not cur_user.exists() or cur_user[0].id == None:
            return JsonResponse({"errors": "trouble_with_user"}, status=400)
        try:
            get_link_status = int(request.GET.get("get_link", 0))
        except:
            pass
        if get_link_status == 1:
            return v_api.GET_get_link(request, cur_user[0])
        return JsonResponse({"errors": "access_error"}, status=400)
    else:
        return JsonResponse({"errors": "access_error"}, status=400)


@csrf_exempt
@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def shared_link(request):
    res = v_api.GET_get_link(request)
    if res:
        return v_api.GET_get_link(request)
    else:
        return redirect("authorization:login")

