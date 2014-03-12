var edited = false;

$('#articleForm').change(function(){
  edited = true;
});

$('#save').click(function(){

  var formData = new FormData($('#articleForm')[0]);
  $.ajax({
      url: '/write',  //Server script to process data
      type: 'POST',
      xhr: function() {  // Custom XMLHttpRequest
          var myXhr = $.ajaxSettings.xhr();
          if(myXhr.upload){ // Check if upload property exists
              
          }
          return myXhr;
      },
      //Ajax events
      // beforeSend: beforeSendHandler,
      success: function(res) {
        if (res.err) {
            $('#error').text(res.err);
            $('#errorAlert').modal('show');
            return;
        }

        edited = false;
        $('#successAlert').modal('show');
      },
      error: function(xhr) {
        $('#error').text(xhr.status);
        $('#errorAlert').modal('show');
      },
      // Form data
      data: formData,
      //Options to tell jQuery not to process data or worry about content-type.
      cache: false,
      contentType: false,
      processData: false
  });
});

function closeEditorWarning(){
  if (edited) {
    return 'It looks like you have been editing something, If you leave before submitting your changes will be lost.';
  }
}

window.onbeforeunload = closeEditorWarning