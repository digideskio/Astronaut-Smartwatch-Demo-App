function updateNavStatus(activePage) {
    var pageTitle = $('#page-title');
    switch (activePage) {
        case 0:
            pageTitle.text("TIMELINE");
            break;
        case 1:
            pageTitle.text("TIMERS");
            break;
        case 2:
            pageTitle.text("ALERTS");
            break;
        case 3:
            pageTitle.text("COMMS");
            break;
    }

    $("#nav-circle-1").toggle(activePage != 0);
    $("#nav-circle-2").toggle(activePage > 1);
    $("#nav-circle-3").toggle(activePage > 2);
    $("#nav-circle-4").toggle(activePage == 0);
    $("#nav-circle-5").toggle(activePage <= 1);
    $("#nav-circle-6").toggle(activePage < 3);
}

(function () {

    if (typeof tizen !== 'undefined') {
        tizen.power.request("SCREEN", "SCREEN_NORMAL");
    }

    //This listens for the back button press
    document.addEventListener('tizenhwkey', function (e) {
        if (e.keyName == "back") {
            var page = document.getElementsByClassName('ui-page-active')[0],
                pageid = page ? page.id : "";
            if (pageid === "dashboard") {
                tizen.application.getCurrentApplication().exit();
            } else {
                tau.back();
            }

        }
    });


    var page = document.getElementById("hsectionchangerPage"),
        changer = document.getElementById("hsectionchanger"),
        sectionChanger;

    page.addEventListener("pagebeforeshow", function (evt) {
        // make SectionChanger object
        sectionChanger = tau.widget.SectionChanger(changer, {
            circular: false,
            orientation: "horizontal",
            useBouncingEffect: true
        });
        updateNavStatus(0);
    });

    page.addEventListener("pagehide", function () {
        // release object
        sectionChanger.destroy();
    });

    changer.addEventListener("sectionchange", function (evt) {
        updateNavStatus(evt.detail.active);
    });

    page.addEventListener('pageshow', function (evt) {
        var page = document.getElementsByClassName('ui-section-active')[0];
        if(page.id == 'timeline') {
            var el = document.getElementById('timeline');
            angular.element(el).scope().activate();
        };
    })
}());