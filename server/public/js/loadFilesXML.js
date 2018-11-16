$(document).ready(function(){
    $('#newFile').change(function(){
        $('#sendNewFile').valid(true)
    });
});
function numberFormat(theNumber){
    console.log(theNumber)
    newNumber = theNumber.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    return newNumber;
};


function loadFile() {
    if($('#sendNewFile').valid()){
        var fileUpload = document.getElementById("newFile");
        var formData = new FormData();
        formData.append('newFile', $("#newFile")[0].files[0]);
        $.ajax({
            type: "POST",
            url: "/users/loadFile",
            data: formData,
            contentType: false,
            processData: false,
            beforeSend: function(){ //se muestra una imagen mientras el ajax se ejecuta
                showIsLoading("Procesando...");
            }
        }).done(function (data) {
            fnOpenSusessDialog("Se ha guardado con exito");
            $("#newFile").val("");
            //recordame que debo actualizar la tabla
            $('#listBills').bootstrapTable('refresh', {silent: true});
        }).fail(function (data) {
            hideIsLoading();
            fnOpenErrorDialog(data.responseJSON.message);
        }).always(function (data) {
            hideIsLoading();
        });
    }
}

$('#sendNewFile').validate({
    errorElement: 'label', //default input error message container
    errorClass: 'help-inline', // default input error message class
    ignore: "",
    rules: {
        newFile: { required: true}
    },
    messages: { // custom messages
        newFile: { required: "Debe buscar y seleccionar el XML." }
    },
    highlight: function (element) { // hightlight error inputs
        $(element).closest('.control-group').addClass('error'); // set error class to the control group
    },
    success: function (label) {
        label.closest('.control-group').removeClass('error');
        label.remove();
    },
    errorPlacement: function (error, element) {
        if (element.closest('.icon-search').size() === 1) {
            error.addClass('help-small no-left-padding').insertAfter(element.closest('.icon-search'));
        } else if (element.next().attr("class")){
            error.addClass('help-small no-left-padding').insertAfter(element.next());
        } else {
            error.addClass('help-small no-left-padding').insertAfter(element);
        }
    }
});