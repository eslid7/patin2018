$(document).ready(function(){
    handleTableData();
    $('#newFile').change(function(){
        $('#sendNewFile').valid(true)
    });
});
isFirtsDatatable = true;
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
                width: '4%'
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
            }, {
                field: 'see',
                title: 'Factura',
                align: 'center',
                width: '7%',
                events: operateEvents,
                formatter: operateFormatter
            }
        ]
    });
};

window.operateEvents = {
	'click .seeBtn': function (e, value, row, index) {
		fnSeeRow(row, index);
	}
};

function operateFormatter(value, row, index) {
	return [
		"<button type='button' class='btn btn-info seeBtn'>",
		"<i class='icon-search'></i> Ver",
		"</button>"
	].join('');
}

function fnSeeRow(row, indx) {
    var date = new Date(row.date);
    $('#bill_modal').modal({show: 'true'});
    $('#consecutive_Bill').html('<font class="subtitle">Número de Factura:</font> ' + row.consecutive);
	$('#date_Bill').html('<font class="subtitle">Fecha y Hora: </font>' + date.toLocaleString());
	$('#money_Bill').html('<font class="subtitle">Moneda :</font> ' + row.codemoney);
	$('#totaltaxes_Bill').html('<font class="subtitle">Total Impuestos:</font> ' + numberFormat(row.totaltaxes));
	$('#total_Bill').html('<font class="subtitle">Total Factura:</font> ' + numberFormat(row.totalsales));
    $('#idissuing_Bill').html('<font class="subtitle">ID Emisor :</font> ' + row.idissuing);
    $('#nameissuing_Bill').html('<font class="subtitle">Nombre Emisor :</font> ' + row.nameissuing);
    $('#addressissuing_Bill').html('<font class="subtitle">Dirrección Emiso :</font> ' + row.addressissuing);
    $('#emailsissuing_Bill').html('<font class="subtitle">Correo :</font> ' + row.emailsissuing);
    $('#idreceiver_Bill').html('<font class="subtitle">Moneda :</font> ' + row.idreceiver);
    $('#namereceiver_Bill').html('<font class="subtitle">Moneda :</font> ' + row.namereceiver);
    $('#emailsreceiver_Bill').html('<font class="subtitle">Moneda :</font> ' + row.emailsreceiver);
    if(!isFirtsDatatable){
        $('#ProductsLines').bootstrapTable('destroy');
    }
    else{
        isFirtsDatatable = false;
    }
    $('#ProductsLines').bootstrapTable({
        height: getHeight(),
        method: 'GET',
        url: "/users/getProductsByID?ids="+row.Products,
        cache: false,
        search :false,
        refresh : true,
        columns: [
            {
                field: 'code',
                title: 'Código',
                sortable: false,
                width: '10%'
            }, {
                field: 'detail',
                title: 'Descripción',
                sortable: false,
                width: '24%'
            }, {
                field: 'quantity',
                title: 'Cantidad',
                sortable: false,
                width: '10%',
                formatter: numberFormat,
                align :'right'
            }, {
                field: 'priceunit',
                title: 'Precio Unitario',
                sortable: false,
                width: '10%',
                formatter: numberFormat,
                align :'right'
            }, {
                field: 'totalrow',
                title: 'Total',
                sortable: false,
                width: '10%',
                formatter: numberFormat,
                align :'right'
            }
        ]
    });
}

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