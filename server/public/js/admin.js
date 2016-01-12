$(document).ready(function () {

    /**
     * USERS
     */

    var usersTable = $('#users-table').editableTable();

    $('#users-save').click(function () {
        usersTable.editableTable('get', function (records) {
            var data = JSON.stringify(records);
            console.log(data);
            $.ajax({
                url: '/admin/users', // php script to retern json encoded string
                data: data,  // serialized data to send on server
                dataType: 'json', // set recieving type - JSON in case of a question
                contentType: 'application/json',
                type: 'POST', // set sending HTTP Request type
                success: function (data) { // callback method for further manipulations
                    console.log("YESS");
                },
                error: function (data) { // if error occured
                    console.error("????");
                }
            });
        });
    });

    $('#user-add').click(function () {
        var userTable = $("#add-user-table").editableTable();
        userTable.editableTable('get', function (records) {
            var newUser = JSON.stringify(records[0]);
            console.log(newUser);
            usersTable.editableTable('add', records[0], {at: 0});
        });
    });

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
                    console.log("YESS");
                },
                error: function (data) { // if error occured
                    console.error("????");
                }
            });
        });
    });

    $('#role-add').click(function () {
        var roleTable = $("#add-role-table").editableTable();
        roleTable.editableTable('get', function (records) {
            var newUser = JSON.stringify(records[0]);
            console.log(newUser);
            rolesTable.editableTable('add', records[0], {at: 0});
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
    //
    //$(".events-table tr").click(function(e) {
    //    var eventId = this.id;
    //    window.location.href = "/admin/events/" + eventId;
    //});

    var attendees = [];
    $("#attendees").multiselect({
        onChange: function () {
            console.log("YYY = " + $('#attendees').val().name);
            //$("#attendees option:selected").each(function(index, user) {
            //    attendees.push($(this).val());
            //});
        }
    });

    function saveEvent(form, url, method) {
        event.preventDefault();
        var array = jQuery(form).serializeArray();
        var json = {};

        $.each(array, function() {
            json[this.name] = this.value || '';
        });
        json['attendees'] = $('#attendees').val().toString().split(',');

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

    $('form#event-edit').bind('submit', function(e) {
        var form = this;
        var url = '/admin/events/' + $(this).data('event-id') + '/edit';
        saveEvent(form, url, "POST");
        event.preventDefault();
        return false;
    });

    $('form#add-event-form').bind('submit', function(e) {
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

    $('form#add-alert-form').bind('submit', function(e) {
        var form = this;
        var url = '/admin/alerts/add';

        event.preventDefault();
        var array = jQuery(form).serializeArray();
        var json = {};

        $.each(array, function() {
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
                    console.log("YESS");
                },
                error: function (data) { // if error occured
                    console.error("????");
                }
            });
        });

    });

    $('#alert-add').click(function () {
        var addAlertTable = $("#add-alert-table").editableTable();
        addAlertTable.editableTable('get', function (records) {
            var newEvent = JSON.stringify(records[0]);
            console.log(newEvent);
            alertsTable.editableTable('add', records[0], {at: 0});
        });
    });

    /**
     * COMMS
     */

    $('#comms_form').submit(function (event) {
        console.log($(this).serialize());
        var jsonData = {};
        var form = $('#comms_form');
        $.each($(form).serializeArray(), function () {
            jsonData[this.name] = this.value;
        });
        var data = JSON.stringify(jsonData);
        console.log(data);
        $.ajax({
            url: '/admin/comms', // php script to retern json encoded string
            data: data,  // serialized data to send on server
            dataType: 'json', // set recieving type - JSON in case of a question
            contentType: 'application/json',
            type: 'POST', // set sending HTTP Request type
            success: function (data) { // callback method for further manipulations
                console.log("YESS");
            },
            error: function (data) { // if error occured
                console.error("????");
            }
        });
        event.preventDefault();
        return false;
    });


});