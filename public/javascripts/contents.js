/* 상단 메뉴 버튼 */
var profile = document.getElementById('profile');
var mini_profile = document.getElementById('mini_profile');
var logout = document.getElementById('logout');
var people = document.getElementById('people');

/* 사진 위한 모달 및 버튼 */
var add_modal = document.getElementById('add_modal_bg');
var edit_modal = document.getElementById('edit_modal_bg');
var zoom_modal = document.getElementById('zoom_modal_bg');
var add = document.getElementById('add');
var upload = document.getElementById('upload');
var r_c = document.getElementsByClassName("r_c"); // room 번호 버튼
var modalcomeout = document.getElementsByClassName("modalcomeout");

/* 사용자가 등록한 사진 관련 객체 */
var index; // 사용자가 선택한 사진의 index 저장
var user_photo = document.getElementsByClassName("user_photo"); // 등록한 사진들
var edit = document.getElementById('edit'); // 사진 변경 정보 보낼 form ID

var photos_name = document.getElementById("photos_name"); // post
var photo_name = document.getElementsByClassName("photo_name");
var photos_x_pos = document.getElementById("photos_x_pos"); // post
var photos_y_pos = document.getElementById("photos_y_pos"); // post

/* 사진 stop, edit, delete 모드 구분 위한 객체 */
var mode = document.getElementById("mode");
var edit_submit = document.getElementById("edit_submit");
var delete_submit = document.getElementById("delete_submit");

var e_p_n = document.getElementById('e_p_n');

$('#add_num').val($('#room_num').val());

/* 사진에 커서 올릴 시 회전하도록 초기화 */
$('.user_photo').addClass("photohover");
$('.user_photo').css('transition', 'all ease 1s');

/* 메뉴에 맞는 페이지로 이동 및 기능 */
function goProfile() {
    location.href = "/profile";
}
function logOut() {
    alert('로그아웃 되었습니다!');
    location.href = "/logout";
}
function goPeople() {
    location.href = "/search";
}

/* 사진 관련 모달 띄우기 및 닫기*/
function addPhoto() {
  add_modal.style.display = 'flex';
}
function closeMsg() {
  if (add_modal.style.display === 'flex') {
    add_modal.style.display = 'none';
  }
  if (edit_modal.style.display === 'flex') {
    edit_modal.style.display = 'none';
  }
  if (zoom_modal.style.display === 'flex') {
    zoom_modal.style.display = 'none';
  }
}

/* room 번호 변경 */
function change_room_num() {
  $('#room_num').val(this.value);
  $('#add_num').val(this.value);
}

/* 사진 이름 및 좌표를 저장할 배열 */
var photo_name_arr = new Array();
var photo_x_pos = new Array();
var photo_y_pos = new Array();

/* 편집한 사진 정보를 저장해 POST로 넘김 */
function move_and_stop() {
  if (this.value === 'stop') {
    $('.user_photo').css('transition', 'none');
    $('.user_photo').removeClass("photohover");
    // 편집 모드이므로 커서 올릴 시 사진 회전 기능 제한
    $(".user_photo").on("click", move_photo());
    alert("편집 모드입니다. 마우스를 이용해 사진의 위치를 수정해주세요!")
    
    this.value = 'move';
  }
  else if (this.value === 'move') {
    for (var i = 0; i < user_photo.length; i++) {
      var x_pos = ($(".user_photo").eq(i)).offset().left;
      var y_pos = ($(".user_photo").eq(i)).offset().top;
      // 사진 좌표 및 크기 저장

      photo_x_pos[i] = x_pos;
      photo_y_pos[i] = y_pos;
      photo_name_arr[i] = photo_name[i].value;
    }
    photos_x_pos.value = photo_x_pos;
    photos_y_pos.value = photo_y_pos;

    photos_name.value = photo_name_arr;
    // 저장한 정보를 POST editPhoto로 넘김
    edit.submit();
  }
}

/* 로그인 했을 시 미니 프로필 띄우기 */
if (add.value != "") {
  $(function(){
    $('#profile').mouseenter(function() {
      $('#mini_profile').css('display', 'grid');
    });
    $('#profile').mouseleave(function() {
      $('#mini_profile').css('display', 'none');
    });
  });
}

/* 사진 위치 이동 및 크기 조절 */
function move_photo() {
  $(".user_photo").draggable( {
    cursor: "pointer",
    containment: "main"
  });
};

/* 우클릭 시 사진 변경 모달 띄우기 */
$(".user_photo").bind("contextmenu", function(e) {
  index = $(this).index();
  e_p_n.value = photo_name[index].value; // 사진 이름
  if (upload.value=="move") {
    $("#edit_modal_bg").css('display', 'flex');
  } // 편집 모드일 때만 변경 가능
  return false;
});

/* 사진 변경 시 값 입력 안 했을 때 원래 값 유지 */
function stay_value() {
  if ( $('#e_p_w').val()==="" ) {
    $('#e_p_w').val( $('.photo_w').eq(index).val() );
  }
  if ( $('#e_p_h').val()==="" ) {
    $('#e_p_h').val( $('.photo_h').eq(index).val() );
  }
}

/* 클릭한 사진을 확대, 간단한 정보 보여줌 */
function zoomPhoto() {
  if (upload.value==='move') {
    return false;
  } // 편집 모드일 시 기능 제한
  var index_zoom = $(this).index();
  var src_zoom = ($('.photo_src').eq(index_zoom)).val();
  var name_zoom = new Array();
  var date = ($('.photo_date').eq(index_zoom)).val();
  // 클릭한 사진 정보 받아옴
  name_zoom = photo_name[index_zoom].value.split('-');
  $("#zoom_img").attr("src", src_zoom);
  $("#zoom_name").html(name_zoom[0]);
  $('#zoom_date').html(date);
  // 정보 옮긴 후 확대 모달 띄움
  zoom_modal.style.display = 'flex';
}

/* 클릭 버튼에 따라 모드 변경 */
function editMode() {
  mode.value = "edit";
  stay_value(); // 값 없을 때 유지
}
function deleteMode() {
  mode.value = "delete";
  stay_value();
}

profile.addEventListener("click", goProfile);
logout.addEventListener("click", logOut);
people.addEventListener("click", goPeople);
// 상단 메뉴 이동 이벤트

edit_submit.addEventListener("click", editMode);
delete_submit.addEventListener("click", deleteMode);
// 사진 편집 및 삭제 모드 구분 이벤트

for (var i = 0; i<user_photo.length; i++) {
  user_photo[i].addEventListener("click", zoomPhoto);
} // 사진 클릭 시 확대 이벤트

for (var i = 0; i < r_c.length; i++) {
  r_c[i].addEventListener("click", change_room_num);
} // room 번호 변경 이벤트

for (var i = 0; i < modalcomeout.length; i++) {
  modalcomeout[i].addEventListener("click", closeMsg);
} // 모달 닫기 이벤트

add.addEventListener("click", addPhoto);
upload.addEventListener("click", move_and_stop); // 사진 편집 후 DB에 저장
// 사진 등록 및 변경 이벤트