/*
 * This file is part of Dependency-Track.
 *
 * Dependency-Track is free software: you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your option) any
 * later version.
 *
 * Dependency-Track is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with
 * Dependency-Track. If not, see http://www.gnu.org/licenses/.
 */

"use strict";

const $common = function() {
};

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing.
 *
 * https://davidwalsh.name/javascript-debounce-function
 */
$common.debounce = function debounce(func, wait, immediate) {
    let timeout;
    return function() {
        let context = this, args = arguments;
        let later = function() {
            timeout = null;
            if (!immediate) {
                func.apply(context, args);
            }
        };
        let callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {
            func.apply(context, args);
        }
    };
};

/**
 * Useful for parsing HREF's
 */
$common.getLocation = function getLocation(href) {
    if (href === null) {
        href = window.location;
    }
    let location = document.createElement("a");
    location.href = href;
    return location;
};

/**
 * Check if a string is empty, null or undefined
 */
$common.isEmpty = function isEmpty(string) {
    return (!string || 0 === string.length);
};

/**
 * Check if a string is blank, null or undefined I use:
 */
$common.isBlank = function isBlank(string) {
    return (!string || /^\s*$/.test(string));
};

//######################################################################################################################
/**
 * Called after we have verified that a user is authenticated (if authentication is enabled)
 */
function initialize(data) {
    //todo: check permissions - populate admin and other navigational things accordingly
    $rest.getVersion(
        function onVersionSuccess(data) {
            // Populates teh system modeal with general app info
            $("#systemAppName").html(data.application);
            $("#systemAppVersion").html(data.version);
            $("#systemAppTimestamp").html(data.timestamp);
            $("#dcAppName").html(data.dependencyCheck.application);
            $("#dcAppVersion").html(data.dependencyCheck.version);

            if (!$.sessionStorage.isSet("token")) {
                $("#nav-logout").css("display", "none");
            }
        }
    );
}

/**
 * Logout function removes the stored jwt token and reloads the page, which will
 * force the login modal to display
 */
function logout() {
    $.sessionStorage.remove("token");
    location.reload();
}
//######################################################################################################################
/**
 * Executed when the login button is clicked. Prevent the form from actually being
 * submitted and uses javascript to submit the form info.
 */
$("#login-form").submit(function(event) {
    event.preventDefault();
    let username = $("#username").val();
    let password = $("#password").val();
    $rest.login(username, password, function(data) {
        $.sessionStorage.set("token", data);
        $("#navbar-container").css("display", "block");
        $("#sidebar").css("display", "block");
        $("#main").css("display", "block");
        $("#modal-login").modal("hide");
        initialize();
    }, function(data) {
        // todo: Display invalid username or password somewhere
    });
    username.val("");
    password.val("");
});

/**
 * Executed when the DOM is ready for JavaScript to be executed.
 */
$(document).ready(function () {

    // Initialize all tooltips
    $('[data-toggle="tooltip"]').tooltip();

    // Get information about the current logged in user (if available)
    $rest.getPrincipalSelf(initialize);

    /**
     * Function that adds the 'active' class to one of the buttons in
     * the sidebar based in the current url and the href of each button.
     */
    (function() {
        let nav = document.getElementById('sidebar'),
            anchor = nav.getElementsByTagName('a'),
            current = window.location.pathname;
        for (let i = 0; i < anchor.length; i++) {
            let pathname = $common.getLocation(anchor[i].href).pathname;
            if(pathname === current) {
                anchor[i].parentElement.className = "active";
            }
        }
    })();

});

/**
 * Defines JSON characters that need to be escaped when data is used in HTML
 */
const __entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
};

/**
 * Perform client-side JSON escaping
 */

function toHtml(string) {
    if(typeof string === 'string') {
        return String(string).replace(/[&<>"'\/]/g, function (s) {
            return __entityMap[s];
        });
    } else {
        return string;
    }
}

/**
 * Extends JQuery
 */
$.extend({

    /**
     * Retrieves the querystring, parses it.
     */
    getUrlVars: function() {
        let vars = [], hash;
        let hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for(let i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    },

    /**
     * Provides a function to extract a param from the querystring.
     */
    getUrlVar: function(name) {
        return $.getUrlVars()[name];
    }
});
