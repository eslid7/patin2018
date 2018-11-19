$(document).ready(function(){


    handleTableData();
    $('#newFile').change(function(){
        $('#sendNewFile').valid(true)
    });
});

function handleTableData () {
    $('#listBills').bootstrapTable({
        height: getHeight(),
        method: 'GET',
        url: '/users/getMyBills',
        cache: false,
        columns: [
            {
                field: 'consecutive',
                title: 'Numero de factura',
                sortable: true,
                width: '8%'
            }, {
                field: 'idissuing',
                title: 'ID Emisor',
                sortable: true,
                width: '5%'
            }, {
                field: 'nameissuing',
                title: 'Nombre Emisor',
                sortable: true,
                width: '15%'
            }, {
                field: 'idreceiver',
                title: 'ID Receptor',
                sortable: true,
                width: '5%'
            }, {
                field: 'namereceiver',
                title: 'Nombre Receptor',
                sortable: true,
                width: '10%'
            }, {
                field: 'codemoney',
                title: 'Moneda',
                sortable: true,
                width: '8%'
            }, {
                field: 'totaltaxes',
                title: 'Total Impuestos',
                sortable: true,
                width: '10%',
                formatter: numberFormat,
                align :'right'
            }, {
                field: 'totalsales',
                title: 'Total Venta',
                sortable: true,
                width: '10%',
                formatter: numberFormat,
                align :'right'
            }
        ]
    });
};


function numberFormat(theNumber){
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

function getHeight() {
	return $(window).height();
}