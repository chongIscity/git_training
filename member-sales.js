var form = $('#tax-invoice');
var form_prepaid = $('#prepaid-code-invoice');
var error = $('.alert-danger', form);
var success = $('.alert-success', form);
var updateDocTimer;
var sdfsdfsdfsdfsdf;

$.validator.addMethod("valueNotEquals", function (value, element, arg) {
    return arg != value;
}, "Value must not equal arg.");

form.validate({
    doNotHideMessage: true, //this option enables to show the error/success messages on tab switch.
    errorElement: 'span', //default input error message container
    errorClass: 'help-block help-block-error', // default input error message class
    focusInvalid: false, // do not focus the last invalid input
    rules: {
        code: {
            required: true
        },
        package_id: {
            valueNotEquals: "0",
            required: true
        }
    },

    messages: { // custom messages for radio buttons and checkboxes
        'package_id': {
            valueNotEquals: "Please select Package !"
        }
    },

    errorPlacement: function (error, element) { // render error placement for each input type
        if (element.attr("name") == "package_id") { // for input group, insert into given container
            error.appendTo('#package-id-error');
        } else {
            element.after(error);
        }
    },

    invalidHandler: function (event, validator) { //display error alert on form submit
        success.hide();
        error.show();
        App.scrollTo(error, -200);
    },

    highlight: function (element) { // hightlight error inputs
        $(element)
            .closest('.form-group').removeClass('has-success').addClass('has-error'); // set error class to the control group
    },

    unhighlight: function (element) { // revert the change done by hightlight
        $(element)
            .closest('.form-group').removeClass('has-error'); // set error class to the control group
    },

    success: function (label) {
        console.log(label);
        if (label.attr("for") == "gender" || label.attr("for") == "payment[]") { // for checkboxes and radio buttons, no need to show OK icon
            console.log("o");
            label
                .closest('.form-group').removeClass('has-error').addClass('has-success');
            label.remove(); // remove error label here
        } else { // display success icon for other inputs
            console.log("p");
            label.addClass('valid') // mark the current input as valid and display OK icon
                .closest('.form-group').removeClass('has-error').addClass('has-success'); // set success class to the control group
        }
    },

    submitHandler: function (form) {
        success.show();
        error.hide();
        //add here some ajax code to submit your form or just call form.submit() if you want to submit the form without ajax
    }

});

var CounterSalesForm = function () {
    $('#payment-error').hide();
    $('type-error').hide();

    if($('#page').val() == 'prepaid_code_page'){
        $("#payment_type_id").prop("disabled", false);
    } else {
        $("#payment_type_id").prop("disabled", true);
    }
    if($('#action').val() == 'topup'){
        var disable_topup = $('#disable_topup').val();
        if(parseInt($('#package_code').val()) <= '6000'){
            $('#type-error').show();
            $("#package_id").prop("disabled", true);
            $("#prd_price_type_id").prop("disabled", true);
            $("#payment_type_id").prop("disabled", true);
        }else if(parseInt($('#package_code').val()) == '10000'){
            $('#type-error').hide();
            // $("#package_id").prop("disabled", true);
            // $("#prd_price_type_id").prop("disabled", true);
            // $("#payment_type_id").prop("disabled", true);
        }else if(disable_topup == 1){
            $('#type-error').show();
            $("#package_id").prop("disabled", true);
            $("#prd_price_type_id").prop("disabled", true);
            $("#payment_type_id").prop("disabled", true);
        }else{
            $('#type-error').hide();
        }
    }
    //get package
    var selectedVal = $('#country_id').val();
    var url;
    if($('#action').val() == 'topup'){
        url = '/member/getMemberTopupPackage';
    }else if($('#action').val() == 'repurchase'){
        url = '/member/getMemberRepurchasePackage';
    }else{
        url = '/member/getMemberRegPackage';
    }
    $.ajax({
        url: url,
        type: 'post',
        dataType: 'json',
        data: {"_token": $('meta[name="csrf-token"]').attr('content'), "country_id": selectedVal},
        success: function (response) {
            $('#package_id').find('option').not(':first').remove();
            $.each(response, function (index, value) {
                console.log($('#package_code').val());
                console.log(value);
                if($('#action').val() == 'topup') {
                    if($('#disable_topup').val() != 1)
                    {
                        if($('#package_code').val() == '6500'){
                            if(value['package_id'] == 64){
                                console.log('6500');
                                $('#package_id').append($("<option></option>").attr("value", value['id']).text(value['name']));
                            }
                        }
                        if($('#package_code').val() == '10000'){
                            if(value['package_id'] == 65){
                                console.log('hi');
                                $('#package_id').append($("<option></option>").attr("value", value['id']).text(value['name']));
                            }
                        }
                    }

                    // if(value['code'] == 'VSI005' || value['code'] == 'VSI006'){
                    //     $('#package_id').append($("<option></option>").attr("value", value['id']).text(value['name']));
                    // }
                }else{
                    $('#package_id').append($("<option></option>").attr("value", value['id']).text(value['name']));
                }
            });
        }
    });

    //get package price
    $("#package_id").change(function () {
        if($('#action').val() == 'topup' || $('#action').val() == 'repurchase'){
            $('#qty').val(1);
            $('#unit_price').val('0.00');
            $('#unit_bv').val('0.00');
            $('#unit_sv').val('0.00');
            $('#unit_nv').val('0.00');
            $('#gross_amount').val('0.00');
            $('#total_tax_amount').val('0.00');
            $('#total_pay_amount').val('0.00');
            $('#exchange_rate').val('0.00');
            $('#crypto_exchange_rate').val('0.00');
            $('#crypto_amount').val('0.00');
            $('#qty').prop("readonly",true);
        }
        $("#payment_type_id").prop("disabled", false);

        var selectedCountry = $('#country_id').val();
        var selectedPackage = $('#package_id').find(":selected").val();
        if (selectedPackage != 0) {
            $.ajax({
                url: '/member/getMemberRegPackagePrice',
                type: 'post',
                dataType: 'json',
                data: {
                    "_token": $('meta[name="csrf-token"]').attr('content'),
                    "country_id": selectedCountry,
                    "product_id": selectedPackage
                },
                success: function (response) {
                    $('#prd_price_type_id').find('option').not(':first').remove();
                    if($('#action').val() == 'topup' || $('#action').val() == 'repurchase'){
                        $('#qty').prop("readonly",false);
                    }
                    $.each(response, function (index, value) {
                        var current_package = parseFloat($("#package_code").val()).toFixed(2);

                        if (value['default'] == 1) {
                            $('#prd_price_type_id').append($("<option></option>").attr({
                                "value": value['prd_price_type_id'],
                                "selected": true
                            }).text(value['price_type_desc']));

                            // if($('#action').val() == 'topup') {
                            //     if($("#package_code").val() == '6500'){
                            //         value['unit_price'] = parseFloat(parseFloat(value['unit_price']) - parseFloat(1000)).toFixed(2);
                            //         value['unit_bv'] = parseFloat(parseFloat(value['unit_bv']) - parseFloat(1000)).toFixed(2);
                            //         value['unit_sv'] = parseFloat(parseFloat(value['unit_sv']) - parseFloat(3000)).toFixed(2);
                            //     }else if($("#package_code").val() == '10000'){
                            //         value['unit_price'] = parseFloat(parseFloat(value['unit_price']) - parseFloat(5000)).toFixed(2);
                            //     }
                            // }

                            $('#unit_price').val(value['unit_price']);
                            $('#unit_bv').val(value['unit_bv']);
                            $('#unit_sv').val(value['unit_sv']);
                            $('#unit_nv').val(value['unit_nv']);
                            $('#pay_amount').val(value['unit_price']);
                            $('#prd_price_id').val(value['price_id']);
                            $('#package_desc').val(value['name']);
                            $('#product_id').val(value['id']);

                            var product_price = parseFloat($('#unit_price').val()).toFixed(2);

                            var grand_total = parseFloat(product_price);
                            $('#gross_amount').val(parseFloat(grand_total).toFixed(2));
                            $('#total_pay_amount').val(parseFloat(grand_total).toFixed(2));

                            getCountryTax(selectedCountry, product_price);
                        } else {
                            $('#prd_price_type_id').append($("<option></option>").attr("value", value['prd_price_type_id']).text(value['price_type_desc']));
                        }

                    });
                }
            });
        } else {
            $('#prd_price_type_id').find('option').not(':first').remove();
            $('#unit_price').val('0.00');
            $('#unit_bv').val('0.00');
            $('#unit_sv').val('0.00');
            $('#unit_nv').val('0.00');
            $('#prd_price_id').val(0);
            $('#prd_price_code').val('');
            $('#package_desc').val('');
            $('#product_id').val(0);
            $('#exchange_rate').val('0.00');
            $('#crypto_exchange_rate').val('0.00');
            $('#crypto_amount').val('0.00');
        }
    });
    
    $("#qty").change(function () {
        var qty = $('#qty').val();
        var selectedCountry = $('#country_id').val();
        var selectedPackage = $('#package_id').find(":selected").val();
        
         $.ajax({
            url: '/member/getMemberRegPackagePrice',
            type: 'post',
            dataType: 'json',
            data: {
                "_token": $('meta[name="csrf-token"]').attr('content'),
                "country_id": selectedCountry,
                "product_id": selectedPackage
            },
            success: function (response) {
                $.each(response, function (index, value){
                console.log(value);
                var new_unit_price = qty * value['unit_price'];
                var new_bv = qty * value['unit_bv'];
                var new_sv = qty * value['unit_sv'];
                var new_nv = qty * value['unit_nv'];
                // var new_total_pay_amount = new_unit_price + (new_unit_price*value['tax_amount']);
                $('#quantity').val(qty);
                // $('#unit_price').val(parseFloat(new_unit_price).toFixed(2));
                // $('#unit_bv').val(parseFloat(new_bv).toFixed(2));
                // $('#unit_sv').val(parseFloat(new_sv).toFixed(2));
                $('#gross_amount').val(parseFloat(new_unit_price).toFixed(2));
                getCountryTax(selectedCountry,new_unit_price);
                
                
                // $('#total_pay_amount').val(parseFloat(new_total_pay_amount).toFixed(2));
                });
            }
        });
    });

    //Prepaid Code Page Change Gross Total and Total price,bv and sv
    $(document).on('blur', ".package_qty", function() {
        
        var unit_price = 0;
        var qty = 0; 
        var total_price = 0;
        var gross_total = 0;
        var country_id = $('#country_id').val();
        var prepaid_grand_total = 0;
        var grand_total = 0;
        var total_tax_amount = 0;
        var total_amount_bs_fee = 0; //to count tax because memberfee cannot include tax.
        var unit_price = $(this).parents('.package_list').find('.unit_price').text();
        var total_price = $(this).parents('.package_list').find('.total_price').text();
        var unit_bv = $(this).parents('.package_list').find('.unit_bv').text();
        var unit_sv = $(this).parents('.package_list').find('.unit_sv').text();
        // var unit_nv = $(this).parents('.package_list').find('.unit_nv').text();
        var unit_tax = $(this).parents('.package_list').find('.tax_per_unit_price').val();
        var row = $(this).parents('.package_list');
        var total_price = unit_price * $(this).val();
        var total_bv = unit_bv * $(this).val();
        var total_sv = unit_sv * $(this).val();
        //var total_nv = unit_nv * $(this).val();
        var total_tax = unit_tax * $(this).val();
        row.find('.total_price').text(parseFloat(total_price).toFixed(2));
        row.find('.total_bv').text(parseFloat(total_bv).toFixed(2));
        row.find('.total_sv').text(parseFloat(total_sv).toFixed(2));
        // row.find('.total_nv').text(parseFloat(total_nv).toFixed(2));
        row.find('.total_tax_per_unit').val(total_tax);
        var gross_total = 0;
        var grand_total = 0;
        var selectedPaymentMethod = $('#payment_type_id').find(":selected").val();
        $('.total_price_row').each(function(){
            var total_price_each_row = $(this).find(".total_price").text();

            gross_total = gross_total + parseFloat(total_price_each_row);
        });

        $('.total_tax_row').each(function(){
            var total_tax_each_row = $(this).find(".total_tax_per_unit").val();
            if(total_tax_each_row == '')
            {
                total_tax_each_row = 0;
            }
            total_tax_amount = total_tax_amount + parseFloat(total_tax_each_row);
        });

        $('.total_sv_row').each(function(){
            var unit_price_bf_fee = $(this).parents('.package_list').find('.total_sv_row').find('#prd_unit_price').val();
            var prd_master_id = $(this).parents('.package_list').find('.total_sv_row').find('#prd_master_id').val();
            var qty_per_row = $(this).parents('.package_list').find('.total_qty_row').find('#package_quantity').val();
            if(qty_per_row == ''){
                qty_per_row = 0;
            }
            if(prd_master_id != 1 && prd_master_id != 20){
                total_amount_bs_fee = total_amount_bs_fee + (unit_price_bf_fee * qty_per_row);
            }
        });
        console.log('here');
        console.log(gross_total);
        // grand_amount = parseFloat(gross_total) + parseFloat(total_tax_amount);
        $('#prepaid_gross_total').val(parseFloat(gross_total).toFixed(2));

        if (selectedPaymentMethod != 0){
            var bankCharge = getBankCharge(selectedPaymentMethod,gross_total,total_tax_amount);
        } else {
            $('#bank_charge').val(0);
            $('#bank_charge_amount').val(0);
        }
        // $('#prepaid_total_tax_amount').val(parseFloat(total_tax_amount).toFixed(2));
        // $('#prepaid_grand_total').val(parseFloat(grand_amount).toFixed(2));
        getCountryPrepaidTax(country_id,total_amount_bs_fee,gross_total);
        // var prepaid_total_tax_amount = $('#prepaid_total_tax_amount').val();
        // grand_amount = parseFloat(gross_total) + parseFloat(prepaid_total_tax_amount);
        // $('#prepaid_grand_total').val(parseFloat(grand_amount).toFixed(2));

    });

    

    //change price type
    $("#prd_price_type_id").change(function () {
        var selectedCountry = $('#country_id').val();
        var selectedPackage = $('#package_id').find(":selected").val();
        var selectedPriceType = $('#prd_price_type_id').find(":selected").val();
        if (selectedPackage != 0 && selectedPriceType != 0) {
            $.ajax({
                url: '/member/getMemberRegPackagePrice',
                type: 'post',
                dataType: 'json',
                data: {
                    "_token": $('meta[name="csrf-token"]').attr('content'),
                    "country_id": selectedCountry,
                    "product_id": selectedPackage,
                    "prd_price_type_id": selectedPriceType
                },
                success: function (response) {
                    $.each(response, function (index, value) {
                        $('#unit_price').val(value['unit_price']);
                        $('#unit_bv').val(value['unit_bv']);
                        $('#unit_sv').val(value['unit_sv']);
                        $('#unit_nv').val(value['unit_nv']);
                        $('#pay_amount').val(value['unit_price']);
                        $('#prd_price_id').val(value['price_id']);
                        $('#prd_price_code').val(value['price_type_code']);
                        $('#package_desc').val(value['name']);
                    });
                }
            });
        } else {
            $('#prd_price_type_id').find('option').not(':first').remove();
            $('#unit_price').val('0.00');
            $('#unit_bv').val('0.00');
            $('#unit_sv').val('0.00');
            $('#unit_nv').val('0.00');
            $('#pay_amount').val('0.00');
            $('#prd_price_id').val(0);
            $('#prd_price_code').val('');
            $('#package_desc').val('');
            $('#exchange_rate').val('0.00');
            $('#crypto_exchange_rate').val('0.00');
            $('#crypto_amount').val('0.00');
        }
    });

    $('#alldebit_pic').click(function (e) {
        var rno = $(this).closest('td').parent()[0].sectionRowIndex;
        $(".dc_check").attr("checked", false); //uncheck all checkboxes
        $("#payment_method_0").prop('checked', true);
    });

    $('#sgepay_pic').click(function (e) {
        var rno = $(this).closest('td').parent()[0].sectionRowIndex;
        console.log(rno);
        $(".cc_check").attr("checked", true); //uncheck all checkboxes
        $("#payment_method_1").prop('checked', true);
    });

    $('.cc_check').click(function (e) {
        var rno = $(this).closest('td').parent()[0].sectionRowIndex;
        $(".cc_check").attr("checked", false); //uncheck all checkboxes
        $("#payment_method_1").prop('checked', true);
    });

    $('.dc_check').click(function (e) {
        var rno = $(this).closest('td').parent()[0].sectionRowIndex;
        $(".dc_check").attr("checked", false); //uncheck all checkboxes
        $("#payment_method_0").prop('checked', true);
    });

    //submit button
    $('#submit_button').on('click', function (e) {
        e.preventDefault();
        var total_pay = 0;

        if (form.valid() == false) {
            return false;
        }

        if($('#payment_type_id').find(":selected").val() == 6){//credit card payment
            var pgw_type = $('.cc_check:checkbox:checked').val();
            if(pgw_type == '' || typeof (pgw_type) === 'undefined'){
                $('#payment-error').show();
                $('#payment-error').text("Please choose credit card payment company");
                return false;
            }else{
                $( "#submit_button" ).prop( "disabled", true );
                createTempInvoice(pgw_type);
            }
        }else if ($('#payment_type_id').find(":selected").val() == 93) {//debit card payment
            var pgw_type = $('.dc_check:checkbox:checked').val();
            if($('#payment_type_country').find(":selected").val() == 0){
                $('#payment-error').show();
                $('#payment-error').text("Please choose country");
                return false;
            }
            if (pgw_type == '' || typeof (pgw_type) === 'undefined') {
                $('#payment-error').show();
                $('#payment-error').text("Please choose debit card payment company");
                return false;
            } else {
                $( "#submit_button" ).prop( "disabled", true );
                createTempInvoice(pgw_type);
            }
        }else if($('#payment_type_id').find(":selected").val() == 161 || $('#payment_type_id').find(":selected").val() == 162){
            createTempInvoice(pgw_type='');
        }else{
            var pay_amount = getPayAmount();
            if (parseFloat(pay_amount) != parseFloat($('#total_pay_amount').val())){
                $('#payment-error').show();
                $('#payment-error').text("Please pay exact amount");
                $(this).val('');
                return false;
            }else{
                $( "#submit_button" ).prop( "disabled", true );
                createTempInvoice(pgw_type='');
                // var orderid = '';
                // $('#payment-error').hide();
                // $('#payment-error').text("");
                // postUpgradeSalesPackage(orderid);
            }
        }
        return false;

    });

    //Prepaid Side Submit Button
    $('#prepaid_submit_button').on('click', function (e) {
        e.preventDefault();
        var obj = {};
        ProductData = [];
        console.log($('#prepaid_code_package tbody > tr').length);
        $("#prepaid_code_package > tbody >tr").each(function(index, element) {
            if($(this).find('.package_qty').val() != '' && $(this).find('.package_qty').val() != 0){
                obj = {"prd_master_id":$(this).find('.prd_master_id').val(),"qty":$(this).find('.package_qty').val()};
                // obj[index]=$(this).find('.prd_master_id').val();
                // obj[index]=$(this).find('.package_qty').val();
                ProductData.push(obj);
            }
        });

        // var total_pay = 0;
        var prd_master_id = 1;
        var prd_price_type_id = 1;
        var quantity = 1;
        prd_master_id = JSON.parse(prd_master_id);
        prd_price_type_id = JSON.parse(prd_price_type_id);
        quantity = JSON.parse(quantity);

        if (form_prepaid.valid() == false) {
            return false;
        }

        if($('#payment_type_id').find(":selected").val() == 6){//credit card payment
            var pgw_type = $('.cc_check:checkbox:checked').val();
            if(pgw_type == '' || typeof (pgw_type) === 'undefined'){
                $('#payment-error').show();
                $('#payment-error').text("Please choose credit card payment company");
                return false;
            }else{
                $( "#prepaid_submit_button" ).prop( "disabled", true );
                createPrepaidTempInvoice(pgw_type);
            }
        }else if ($('#payment_type_id').find(":selected").val() == 93) {//debit card payment
            var pgw_type = $('.dc_check:checkbox:checked').val();
            if($('#payment_type_country').find(":selected").val() == 0){
                $('#payment-error').show();
                $('#payment-error').text("Please choose country");
                return false;
            }
            if (pgw_type == '' || typeof (pgw_type) === 'undefined') {
                $('#payment-error').show();
                $('#payment-error').text("Please choose debit card payment company");
                return false;
            } else {
                $( "#prepaid_submit_button" ).prop( "disabled", true );
                createPrepaidTempInvoice(pgw_type);
            }
        }else if($('#payment_type_id').find(":selected").val() == 161 || $('#payment_type_id').find(":selected").val() == 162){
            createPrepaidTempInvoice(pgw_type='');
        }else{
            var pay_amount = getPayAmount();

            if (parseFloat(pay_amount) != parseFloat($('#prepaid_grand_total').val())){
                $('#payment-error').show();
                $('#payment-error').text("Please pay exact amount");
                $(this).val('');
                return false;
            }else{
                $( "#prepaid_submit_button" ).prop( "disabled", true );
                createPrepaidTempInvoice(pgw_type='');
                // var orderid = '';
                // $('#payment-error').hide();
                // $('#payment-error').text("");
                // postUpgradeSalesPackage(orderid);
            }
        }
        return false;

    });

    return {
        //main function to initiate the module
        init: function () {
        }
    };

}();


var getPaymentOptionval = function () {
    var selectedPaymentMethod = $('#payment_type_id').find(":selected").val();
    var paymentAmount = $('#gross_amount').val();
    var taxAmount = $('#total_tax_amount').val();
    var member_id = $('#member_id').val();
    $('#cc_tbl').hide();
    $('#dc_tbl').hide();
    $('#payment_tbl').hide();
    $('#payment_tbl>tbody').empty();
    console.log(paymentAmount);
    if (selectedPaymentMethod == 6) {
        $("#prepaid_div").css('display', 'none');
        $("#payment_type_country_div").css('display', 'none');
        $("#payment_type_crypto").css('display', 'none');
        $('#payment_tbl> td').hide();
        $('#dc_tbl').hide();
        $('#cc_tbl').show();
        var bankCharge = getBankCharge(selectedPaymentMethod,paymentAmount,taxAmount);
    } else if (selectedPaymentMethod == 93) {
        $("#prepaid_div").css('display', 'none');
        $("#payment_type_country_div").css('display', 'block');
        $("#payment_type_crypto").css('display', 'none');
        $('#payment_tbl> td').hide();
        $('#cc_tbl').hide();
        $('#dc_tbl').show();
        var bankCharge = getBankCharge(selectedPaymentMethod,paymentAmount,taxAmount);
    } else if (selectedPaymentMethod == 133){
        $("#payment_type_country_div").css('display', 'none');
        $("#payment_type_crypto").css('display', 'none');
        $('#payment_tbl').show();
        var tds = '<tr>';
        tds += '<td colspan="6">Prepaid code is not available</td>';
        tds += '</tr>';
        $('#payment_tbl').append(tds);
        $('#bank_charge').val(0);
        $('#bank_charge_amount').val(0);
        $('#prepaid_grand_total').val((parseFloat(paymentAmount) + parseFloat(taxAmount)).toFixed(2));
        $('#total_pay_amount').val((parseFloat(paymentAmount) + parseFloat(taxAmount)).toFixed(2));
    } else if (selectedPaymentMethod == 161 || selectedPaymentMethod == 162){
        $("#payment_tbl > tbody").empty();
        $('#payment_tbl').hide();
        $('#cc_tbl').hide();
        $('#dc_tbl').hide();
        $("#prepaid_div").css('display', 'none');    
        $("#payment_type_crypto").css('display', 'block');
        $(".cc_check").attr("checked", false); //uncheck all checkboxes
        $(".dc_check").attr("checked", false); //uncheck all checkboxes
        $('#bank_charge').val(0);
        $('#bank_charge_amount').val(0);
        $('#prepaid_grand_total').val((parseFloat(paymentAmount) + parseFloat(taxAmount)).toFixed(2));
        $('#total_pay_amount').val((parseFloat(paymentAmount) + parseFloat(taxAmount)).toFixed(2));

        if(selectedPaymentMethod == 161){
            $('#payment_method').val('btc');  
        } else{
            $('#payment_method').val('eth');
        }
        
        getCryptoTotalAmount();
    }  else {
        $('#bank_charge').val(0);
        $('#bank_charge_amount').val(0);
        $('#prepaid_grand_total').val((parseFloat(paymentAmount) + parseFloat(taxAmount)).toFixed(2));
        $('#total_pay_amount').val((parseFloat(paymentAmount) + parseFloat(taxAmount)).toFixed(2));
        $("#prepaid_div").css('display', 'none');
        $("#payment_type_country_div").css('display', 'none');
        $("#payment_type_crypto").css('display', 'none');
        $.ajax({
            url: '/member/checkSelectedPaymentMethod',
            type: 'post',
            dataType: 'json',
            data: {
                "_token": $('meta[name="csrf-token"]').attr('content'),
                "payment_type_id": selectedPaymentMethod,
                "member_id": member_id
            },
            success: function (response) {
                var rno = 0;
                $("#payment_tbl > tbody").empty();
                $('#payment-error').hide();
                $('#payment-error').text("");
                $('#cc_tbl').hide();
                $(".cc_check").attr("checked", false); //uncheck all checkboxes
                $('#payment_tbl').show();
                var tds = '<tr>';
                console.log(response);
                if (response.length > 0) {
                    $.each(response, function (index, value) {
                        if (value['ewallet_type_desc'] != '' && typeof (value['ewallet_type_desc']) != 'undefined') {
                            tds += '<td><input type="checkbox" id="selected_ewallet_type_id_' + rno + '" name="selected_ewallet_type_id[]" value="' + value['ewallet_type_id'] + '"/></td>';
                            tds += '<td><span id="ewallet_type_desc_' + rno + '">' + value['ewallet_type_desc'] + '</span> Balance: ' + parseFloat(value['balance']).toFixed(2) + '</td>';
                            // tds += '<td><input type="text" size="3" class="form-control input-sm" id="ref_no_' + rno + '" name="ref_no[]" style="text-align: left"></td>';
                            // tds += '<td><input type="text" size="10" class="form-control input-sm price" style="text-align: left" id="approval_no_' + rno + '" name="approval_no[]"></td>';
                            // tds += '<td><input type="text" size="10" class="form-control input-sm tax" style="text-align: left" id="remark_' + rno + '" name="remark[]" ></td>';
                            // tds += '<td><input type="number" size="10" class="form-control input-sm paid" onkeypress="return event.charCode >= 48" min="0" style="text-align: right" id="pay_amount_' + rno + '" name="pay_amount[]"><input class="balance" type="hidden" id="balance_' + rno + '" name="balance[]" value="' + value['balance'] + '"><input class="balance" type="hidden" id="ewallet_type_id_' + rno + '" name="ewallet_type_id[]" value="' + value['ewallet_type_id'] + '"><input type="hidden" name="payment_method" value="ewallet"></td>';
                            tds += '<td><input type="number" size="10" class="form-control input-sm paid" step="0.01" min="0" style="text-align: right" id="pay_amount_' + rno + '" name="pay_amount[]"><input class="balance" type="hidden" id="balance_' + rno + '" name="balance[]" value="' + value['balance'] + '"><input class="balance" type="hidden" id="ewallet_type_id_' + rno + '" name="ewallet_type_id[]" value="' + value['ewallet_type_id'] + '"><input type="hidden" name="payment_method" value="ewallet"></td>';
                            rno++;
                        }else{
                            tds += '<td colspan="6">No Ewallet Available</td>';
                        }
                        tds += '</tr>';
                    });
                } else {
                    tds += '<td colspan="6">No Ewallet Available</td>';
                    tds += '</tr>';
                }
                $('#payment_tbl').append(tds);
            }
        });
    }

}

var getPayAmount = function() {
    var total_pay = 0;
    var product_amount = $("#eproducts #unit_price").val();

    var pending = 0;
    $('#payment_tbl tbody > tr').each(function (i, index) {
        var pay_amount = parseFloat($(this).find('.paid').val());
        if (!isNaN(pay_amount)) {
            total_pay += pay_amount;
        }
    });
    
    return total_pay;
}

var createTempInvoice = function (pgw_type){
    var obj = {};
    console.log('hi');
    console.log(pgw_type);
    $.ajax({
        type: "POST",
        url: "postTempReceipt",
        data: $('#tax-invoice').serialize(),
        dataType: 'json',
        success: function (response) {
            if(typeof (response.pgw) != 'undefined'){
                var gatewayObj = response.pgw;
                callToPaymentGateway(gatewayObj, pgw_type);//post data to payment gateway
                updateDocTimer = setInterval(function(){updateDocStatus(response.doc_no,response)}, 10000);  // call getUpdates every minute
                setTimeout( function(){
                    postUpdateDocStatus(response.doc_no);
                }  , 300000 );
                // window.setTimeout(postUpdateDocStatus, 1000 * 60 * 20);//use yourfunction(); instead without timeout
            }else{
                if(typeof(response.type) != 'undefined' || response.type == 'crypto'){
                    swal({
                        title: response.msgTitle,
                        text: response.msg,
                        type: response.msgType,
                        html:true
                    }, function() {
                        window.location = window.location.href;
                    });
                    return false;
                } else {
                    if(response.msgType == 'error'){
                        st_sweetalert(response);
                        $( "#submit_button" ).prop( "disabled", false );
                    }else {
                        postUpgradeSalesPackage(response.doc_no, response.id, 0);
                    }
                }
                // postUpgradeSalesPackage(response.doc_no, response.id, 0);
            }
        },
        error: function (response) {
        }
    });
}

var createPrepaidTempInvoice = function (pgw_type){
    var obj = {};
    $.ajax({
        type: "POST",
        url: "postTempPrepaidReceipt",
        data:
        $('#prepaid-code-invoice').serialize(),
        dataType: 'json',
        success: function (response) {
            if(typeof (response.pgw) != 'undefined'){
                var gatewayObj = response.pgw;
                callToPaymentGateway(gatewayObj, pgw_type);//post data to payment gateway
                updateDocTimer = setInterval(function(){updateDocStatus(response.doc_no,response)}, 10000);  // call getUpdates every minute
                setTimeout( function(){
                    postUpdateDocStatus(response.doc_no);
                }  , 300000 );
                // window.setTimeout(postUpdateDocStatus, 1000 * 60 * 20);//use yourfunction(); instead without timeout
            }else{
                if(typeof(response.type) != 'undefined' || response.type == 'crypto'){
                    swal({
                        title: response.msgTitle,
                        text: response.msg,
                        type: response.msgType,
                        html:true
                    }, function() {
                        window.location = window.location.href;
                    });
                    return false;
                } else {
                    if(response.msgType == 'error'){
                        st_sweetalert(response);
                        $( "#prepaid_submit_button" ).prop( "disabled", false);
                    }else {
                        postPrepaidCodePackage(response.doc_no, response.id, 0,response);  
                    }
                }
            }
        },
        async: false,
        error: function (response) {
        }
    });
}

function getCountryTax(country_id, product_price) {
    var percent = 0;
    var taxable_amount = 0;
    var product_amount = product_price;
    var payable_amount = 0;
    var selectedPaymentMethod = $('#payment_type_id').find(":selected").val();
    $.ajax({
        type: "get",
        url: '/getCurrencyTax',
        data: {'e1':country_id}, // serializes the form's elements.
        success: function(response) {
            if(response.length > 0){
                $(response).each(function (i, object) {
                    percent = object.percent;
                    taxable_amount = parseFloat((parseInt(product_amount) * (percent/100))).toFixed(2);
                    payable_amount = parseFloat(parseInt(product_amount) + parseInt(taxable_amount)).toFixed(2);
                    $('#total_tax_amount').val(taxable_amount);
                    // $('#total_pay_amount').val(payable_amount);
                    // $('#prepaid_grand_total').val(payable_amount);
                    // $('#product_grand_total').val(payable_amount);
                    var bankCharge = getBankCharge(selectedPaymentMethod,product_amount,taxable_amount);
                });
            }else{
                payable_amount = parseFloat(parseInt(product_amount) + parseInt(taxable_amount)).toFixed(2);
                $('#total_tax_amount').val(parseFloat(taxable_amount).toFixed(2));
                // $('#total_pay_amount').val(payable_amount);
                // $('#prepaid_grand_total').val(payable_amount);
                // $('#product_grand_total').val(payable_amount);
                var bankCharge = getBankCharge(selectedPaymentMethod,product_amount,taxable_amount);
            }

            if(selectedPaymentMethod == 161 || selectedPaymentMethod == 162){
                getCryptoTotalAmount();
            }
        }
    });
}

function getCountryPrepaidTax(country_id, product_price_bf_fee,gross_total) {
    var percent = 0;
    var taxable_amount = 0;
    var product_amount_bf_fee = product_price_bf_fee;
    var product_amount = gross_total;
    var payable_amount = 0;
    var selectedPaymentMethod = $('#payment_type_id').find(":selected").val();
    console.log('hello');
    console.log(gross_total);
    $.ajax({
        type: "get",
        url: '/getCurrencyTax',
        data: {'e1':country_id}, // serializes the form's elements.
        success: function(response) {
            if(response.length > 0){
                $(response).each(function (i, object) {
                    percent = object.percent;
                    taxable_amount = parseFloat((parseInt(product_amount_bf_fee) * (percent/100))).toFixed(2);
                    payable_amount = parseFloat(parseInt(product_amount) + parseInt(taxable_amount)).toFixed(2);
                    $('#total_tax_amount').val(taxable_amount);
                    // $('#prepaid_grand_total').val(parseFloat(payable_amount).toFixed(2));
                });
            }else{
                payable_amount = parseFloat(parseInt(product_amount) + parseInt(taxable_amount)).toFixed(2);
                $('#total_tax_amount').val(parseFloat(taxable_amount).toFixed(2));
                // $('#prepaid_grand_total').val(parseFloat(payable_amount).toFixed(2));
            }

            if(selectedPaymentMethod == 161 || selectedPaymentMethod == 162){
                getCryptoTotalAmount();
            }
        }
    });
}


var callToPaymentGateway = function (obj, type){
    var location = obj.URL;

    var form = '';
    $.each( obj, function( key, value ) {
        value = value.split('"').join('\"')
        form += '<input type="hidden" name="'+key+'" value="'+value+'">';
    });
    $('<form action="' + location + '" method="POST" target="_blank">' + form + '</form>').appendTo($(document.body)).submit();
}

var postUpdateDocStatus = function (doc_no){
    console.log("active");
    $.ajax({
        type: "get",
        url: '/getDocStatus',
        data: {'e1':doc_no}, // serializes the form's elements.
        success: function(response) {
            $(response).each(function (i, object) {
                var status = object.status;
                if(status == 'A'){
                    $( "#submit_button" ).prop( "disabled", false );
                    $( "#prepaid_submit_button" ).prop( "disabled", false );
                    clearInterval(updateDocTimer);
                }
            });
        }
    });
}

// var postUpdateDocStatus = function (){
//     var redirect = 'http://wvvc.is.my/member/complete-order';
//     $.redirectPost(redirect, {'doc_no': $("#doc_no").text(), 'amt': $("#total_pay_amount").text(), '_token': $('meta[name="csrf-token"]').attr('content')});
// }

var updateDocStatus = function (doc_no,data){
    $.ajax({
        type: "get",
        url: '/getDocStatus',
        data: {'e1':doc_no}, // serializes the form's elements.
        success: function(response) {
            console.log(response);
            $(response).each(function (i, object) {
                if(object.status == '00'){
                    var orderid = object.id;
                    var invid = object.sls_master_id;
                    var order_no = object.doc_no;
                    var action = object.action;
                    console.log('hi');
                    if(action == 'prepaid_pin')
                    {
                        postPrepaidCodePackage(order_no,orderid,invid,data);
                    }else{
                        postUpgradeSalesPackage(order_no,orderid,invid);
                    }
                }
            });
        }
    });
}

var postUpgradeSalesPackage = function (order_no, orderid, invid){
    clearInterval(updateDocTimer);
    var url = window.location.href;
    var data = new FormData($("#tax-invoice")[0]);
    data.append('orderid', orderid);
    data.append('invid', invid);
    data.append('doc_no', order_no);
    $.ajax({
        url: url,
        type: 'post',
        data: data,
        dataType: 'json',
        contentType: false,
        processData: false,
        success: function (response) {
            response.url = url;
            sc_sweetalert(response);
        }
    });
}

var postPrepaidCodePackage = function (order_no, orderid, invid,input_data){
    clearInterval(updateDocTimer);
    var url = window.location.href;
    data = new FormData($("#prepaid-code-invoice")[0]);
    data.append('orderid', orderid);
    data.append('invid', invid);
    data.append('doc_no', order_no);
    $.ajax({
        url: url,
        type: 'post',
        data: data,
        dataType: 'json',
        contentType: false,
        processData: false,
        success: function (response) {
            response.url = url;
            var purchase_data = input_data.data.item;
            var header_data = input_data.data.header;
            if(invid == '0')
            {
                invid = response.sls_master_id;
            }
            var order_info = 
            {
                order_no : order_no,
                orderid : orderid,
                invid : invid
            };
            $(purchase_data).each(function(index,value){
                postPrepaidPin(header_data,value,order_info);
            });
            
            sc_sweetalert(response);

            
        }
    });
}

var postPrepaidPin = function(header_data,purchase_data,order_info){
    $.ajax({
        url:"postPrepaidPin",
        data:{
            'header_data' : header_data,
            'purchase_data' : purchase_data,
            'order_info' : order_info
        },
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        dataType: 'json',
        type:'post',
        success:function(response){

        }
    });
}

var getCryptoTotalAmount = function(){
    var selectedPaymentMethod = $('#payment_type_id').find(":selected").val();
    var to = '';
    if(selectedPaymentMethod == 161){
        to = 'BTC';
    } else{
        to = 'ETH';
    }
    $.ajax({
        url: '/api/getCoinBase/USD-'+to,
        type: 'get',
        dataType: 'json',
        success:function(response){
            var rate = parseFloat(response).toFixed(8);
            $('#exchange_rate').val(rate);
            $('#crypto_exchange_rate').val(rate);
            var total_amount = $('#total_pay_amount').val();
            var prepaid_total_amount = $('#prepaid_grand_total').val();
            var converted_amount = parseFloat(rate * total_amount).toFixed(8);
            var prepaid_converted_amount = parseFloat(rate * prepaid_total_amount).toFixed(8);
            //console.log(converted_amount);
            $('#crypto_amount').val(converted_amount);
            $('#prepaid_crypto_amount').val(prepaid_converted_amount);
        }
    });
}

$("#payment_tbl").on('keyup', '.paid', function (e) {
    var rno = $(this).closest('td').parent()[0].sectionRowIndex;
    var paid_amount = parseFloat($(this).val()).toFixed(2);
    var abalance = 0;

    abalance = parseFloat($("#balance_"+rno).val()).toFixed(2);
    var payment_desc = $("#ewallet_type_desc_"+rno).text();
    if(paid_amount != 0 && paid_amount!= ''){
        $("#selected_ewallet_type_id_"+rno).prop('checked', true);
    }else{
        $("#selected_ewallet_type_id_"+rno).prop('checked', false);
    }

    if (parseFloat(paid_amount) > parseFloat(abalance)){
        $('#payment-error').show();
        $('#payment-error').text(payment_desc+" Insufficient Fund");
        $(this).val('');
        $("#selected_ewallet_type_id_"+rno).prop('checked', false);
        return false;
    }
});

jQuery(document).ready(function () {
    CounterSalesForm.init();
});

function getBankCharge(payment_id,amount,tax){
    $.ajax({
        url: 'getBankCharge',
        headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
        type: 'POST',
        data: {payment_type_id: payment_id},
        dataType: "json",
        async: false,
        success: function (response) {
            console.log(amount);
            if(response.length > 0) {
                if(response[0].charge_percent > 0) {
                    var percent = parseFloat(response[0].charge_percent);
                    var amt = parseFloat(amount);
                    var tx = parseFloat(tax);
                    var taxedAmt = amt + tx;
                    var total = (taxedAmt / 100 * percent) + taxedAmt ;
                    var charge = total - taxedAmt;
                    $('#bank_charge').val(percent + '%');
                    $('#prepaid_grand_total').val(total.toFixed(2));
                    $('#total_pay_amount').val(total.toFixed(2));
                    $('#final_pay_amount').val(total.toFixed(2));
                    $('#bank_charge_amount').val(charge.toFixed(2));
                }else {
                    var charge = parseFloat(response[0].charge_amount);
                    var amt = parseFloat(amount);
                    var tx = parseFloat(tax);
                    var taxedAmt = amt + tx;
                    var total = taxedAmt + charge;
                    var charge = total - taxedAmt;
                    $('#bank_charge').val(response[0].charge_amount);
                    $('#prepaid_grand_total').val(total.toFixed(2));
                    $('#total_pay_amount').val(total.toFixed(2));
                    $('#final_pay_amount').val(total.toFixed(2));
                    $('#bank_charge_amount').val(charge.toFixed(2));
                }
            }else {
                var amt = parseFloat(amount);
                var tx = parseFloat(tax);
                var taxedAmt = amt + tx;
                $('#bank_charge').val(0.00);
                $('#prepaid_grand_total').val(taxedAmt.toFixed(2));
                $('#total_pay_amount').val(taxedAmt.toFixed(2));
                $('#final_pay_amount').val(taxedAmt.toFixed(2));
                $('#bank_charge_amount').val(0.00);
            }
        }
    });
}