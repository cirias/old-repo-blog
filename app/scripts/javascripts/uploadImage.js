

$('#image').change(function(){
  edited = true;
  
  var file = this.files[0];
  var name = file.name;
  var size = file.size;
  var type = file.type;
  //Your validation
  // });
  // $('#imageBtn').click(function(){
  var formData = new FormData($('#imageForm')[0]);
  $('#progress').show();
  $.ajax({
      url: '/image/upload',  //Server script to process data
      type: 'POST',
      xhr: function() {  // Custom XMLHttpRequest
          var myXhr = $.ajaxSettings.xhr();
          if(myXhr.upload){ // Check if upload property exists
              myXhr.upload.addEventListener('#progress',progressHandlingFunction, false); // For handling the progress of the upload
          }
          return myXhr;
      },
      //Ajax events
      // beforeSend: beforeSendHandler,
      success: function(res) {
        if (res.err) {
            status('Opps! '+res.err);
            return;
        }

        status('Success!');
        appendPath(res.path);
        $('#progress').hide();
      },
      error: function(xhr) {
        status('Error: ' + xhr.status);
        $('#progress').hide();
      },
      // Form data
      data: formData,
      //Options to tell jQuery not to process data or worry about content-type.
      cache: false,
      contentType: false,
      processData: false
  });
});

function progressHandlingFunction(e){
  if(e.lengthComputable){
      $('#progress').attr({'aria-valuenow':e.loaded,'aria-valuemax':e.total});
  }
}

function status(message) {
    $('#status').text(message);
}

function appendPath(path) {
    $('#imagePathList').append('<li><small>'+path.replace('./app/','/')+'</small></li>');
}


