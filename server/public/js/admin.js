$(document).ready(function () {

    $("#data-saved").hide();
    $("#data-save-fail").hide();

    /**
     * ROLES
     */

    var rolesTable = $('#roles-table').editableTable();

    $('#roles-save').click(function () {
        rolesTable.editableTable('get', function (records) {
            var data = JSON.stringify(records);
            console.log(data);
            $.ajax({
                url: '/admin/roles', // php script to retern json encoded string
                data: data,  // serialized data to send on server
                dataType: 'json', // set recieving type - JSON in case of a question
                contentType: 'application/json',
                type: 'POST', // set sending HTTP Request type
                success: function (data) { // callback method for further manipulations
                    $("#data-saved").show();
                    $("#data-saved").fadeOut(2000, function () {
                        $("#data-saved").hide();
                    });
                },
                error: function (data) { // if error occured
                    $("#data-save-fail").show();
                    $("#data-save-fail").fadeOut(2000, function () {
                        $("#data-save-fail").hide();
                    });
                }
            });
        });
    });


    $('#role-add').click(function () {
        event.preventDefault();
        var addRoleTable = $("#add-role-table").editableTable();
        addRoleTable.editableTable('get', function (records) {
            var newRole = JSON.stringify(records[0]);
            $.ajax({
                url: '/admin/roles/add', // php script to retern json encoded string
                data: newRole,  // serialized data to send on server
                dataType: 'json', // set recieving type - JSON in case of a question
                contentType: 'application/json',
                type: 'POST', // set sending HTTP Request type
                success: function (data) { // callback method for further manipulations
                    console.log("YESS");
                    window.location = '/admin/roles';
                },
                error: function (data) { // if error occured
                    console.error("????");
                    window.location = '/admin/roles';
                }
            });
            return false;
        });
    });


    /**
     * EVENTS
     */

    $('.event-color').colorpicker({
        colorSelectors: {
            '#777777': '#777777',
            '#337ab7': '#337ab7',
            '#5cb85c': '#5cb85c',
            '#5bc0de': '#5bc0de',
            '#f0ad4e': '#f0ad4e',
            '#d9534f': '#d9534f'
        }
    });

    var roles = [];
    $("#roles").multiselect({
        onChange: function () {
            console.log("YYY = " + $('#roles').val().name);
            //$("#attendees option:selected").each(function(index, user) {
            //    attendees.push($(this).val());
            //});
        }
    });

    function saveEvent(form, url, method) {
        event.preventDefault();
        var array = jQuery(form).serializeArray();
        var json = {};

        $.each(array, function () {
            json[this.name] = this.value || '';
        });
        json['roles'] = $('#roles').val().toString().split(',');

        json = JSON.stringify(json);

        $.ajax({
            type: method,
            url: url,
            data: json,
            contentType: 'application/json',
            dataType: "json",
            success: function (response) {
                window.location = '/admin/events';
            },
            error: function (err) {
                window.location = '/admin/events';
            }
        });

        return false;
    }

    $('form#event-edit').bind('submit', function (e) {
        var form = this;
        var url = '/admin/events/' + $(this).data('event-id') + '/edit';
        saveEvent(form, url, "POST");
        event.preventDefault();
        return false;
    });

    $('form#add-event-form').bind('submit', function (e) {
        var form = this;
        var url = '/admin/events/';
        saveEvent(form, url, "POST");
        event.preventDefault();
        return false;
    });

    $('#event-add').click(function () {
        var addEventTable = $("#add-event-table").editableTable();
        addEventTable.editableTable('get', function (records) {
            var newEvent = JSON.stringify(records[0]);
            console.log(newEvent);
            eventsTable.editableTable('add', records[0], {at: 0});
        });
    });

    /**
     * ALERTS
     */
    var alertsTable = $('#alerts-table').editableTable();

    $('form#add-alert-form').bind('submit', function (e) {
        var form = this;
        var url = '/admin/alerts/add';

        event.preventDefault();
        var array = jQuery(form).serializeArray();
        var json = {};

        $.each(array, function () {
            json[this.name] = this.value || '';
        });

        json = JSON.stringify(json);

        $.ajax({
            type: 'POST',
            url: url,
            data: json,
            contentType: 'application/json',
            dataType: "json",
            success: function (response) {
                window.location = '/admin/alerts';
            },
            error: function (err) {
                window.location = '/admin/alerts';
            }
        });

        return false;
    });

    $('#alerts-save').click(function () {
        alertsTable.editableTable('get', function (records) {
            var data = JSON.stringify(records);
            console.log(data);
            $.ajax({
                url: '/admin/alerts', // php script to retern json encoded string
                data: data,  // serialized data to send on server
                dataType: 'json', // set recieving type - JSON in case of a question
                contentType: 'application/json',
                type: 'POST', // set sending HTTP Request type
                success: function (data) { // callback method for further manipulations
                    $("#data-saved").show();
                    $("#data-saved").fadeOut(2000, function () {
                        $("#data-saved").hide();
                    });
                },
                error: function (data) { // if error occured
                    $("#data-save-fail").show();
                    $("#data-save-fail").fadeOut(2000, function () {
                        $("#data-save-fail").hide();
                    });
                }
            });
        });

    });

    /**
     * COMMS
     */

    var commsTable = $('#comms-table').editableTable();

    $('#comms-save').click(function (event) {
        commsTable.editableTable('get', function (records) {
            var data = JSON.stringify(records);
            $.ajax({
                url: '/admin/comms', // php script to retern json encoded string
                data: data,  // serialized data to send on server
                dataType: 'json', // set recieving type - JSON in case of a question
                contentType: 'application/json',
                type: 'POST', // set sending HTTP Request type
                success: function (data) { // callback method for further manipulations
                    $("#data-saved").show();
                    $("#data-saved").fadeOut(2000, function () {
                        $("#data-saved").hide();
                    });
                },
                error: function (data) { // if error occured
                    $("#data-save-fail").show();
                    $("#data-save-fail").fadeOut(2000, function () {
                        $("#data-save-fail").hide();
                    });
                }
            });
        })
    });

    $('#outages-add').click(function () {
        event.preventDefault();
        var addOutageTable = $("#add-outage-table").editableTable();
        addOutageTable.editableTable('get', function (records) {
            var newOutage = JSON.stringify(records[0]);
            $.ajax({
                url: '/admin/comms/outages/add', // php script to retern json encoded string
                data: newOutage,  // serialized data to send on server
                dataType: 'json', // set recieving type - JSON in case of a question
                contentType: 'application/json',
                type: 'POST', // set sending HTTP Request type
                success: function (data) { // callback method for further manipulations
                    console.log("YESS");
                    window.location = '/admin/comms';
                },
                error: function (data) { // if error occured
                    console.error("????");
                    window.location = '/admin/comms';
                }
            });
            return false;
        });
    });

    var outagesTable = $("#comms-outages-table").editableTable();

    $('#outages-save').click(function () {
        outagesTable.editableTable('get', function (records) {
            var data = JSON.stringify(records);
            console.log(data);
            $.ajax({
                url: '/admin/comms/outages',
                data: data,
                dataType: 'json',
                contentType: 'application/json',
                type: 'POST',
                success: function (data) {
                    $("#data-saved").show();
                    $("#data-saved").fadeOut(2000, function () {
                        $("#data-saved").hide();
                    });
                },
                error: function (data) {
                    $("#data-save-fail").show();
                    $("#data-save-fail").fadeOut(2000, function () {
                        $("#data-save-fail").hide();
                    });
                }
            });
        });
    });

    $('#title, #name, #location, tr.role input, #system').maxlength({
        threshold: 10,
        allowOverMax: true,
        placement: 'left'
    });

    setInterval(function() {
        var time = moment().tz('ETC/GMT').format('HH:mm:ss MM/DD/YY');
        $("#clock").html(time + " GMT");
    }, 1000);
});