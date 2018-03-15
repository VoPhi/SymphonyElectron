const { ipcRenderer, remote } = require('electron');
const apiEnums = require('../enums/api.js');
const apiCmds = apiEnums.cmds;
const apiName = apiEnums.apiName;
const htmlContents = require('./contents');

// Default title bar height
const titleBarHeight = '32px';

class TitleBar {

    constructor() {
        this.window = remote.getCurrentWindow();
        this.domParser = new DOMParser();

        const titleBarParsed = this.domParser.parseFromString(htmlContents.titleBar, 'text/html');
        this.titleBar = titleBarParsed.getElementById('title-bar');
    }

    initiateWindowsTitleBar() {

        const actionItemsParsed = this.domParser.parseFromString(htmlContents.button, 'text/html');
        const buttons = actionItemsParsed.getElementsByClassName('action-items');

        let items = Array.from(buttons[0].children);
        for (let i of items) {
            this.titleBar.appendChild(i);
        }

        const updateIcon = TitleBar.updateIcons;
        const updateTitleBar = TitleBar.updateTitleBar;

        // Event to capture and update icons
        this.window.on('maximize', updateIcon.bind(this, true));
        this.window.on('unmaximize', updateIcon.bind(this, false));
        this.window.on('enter-full-screen', updateTitleBar.bind(this, true));
        this.window.on('leave-full-screen', updateTitleBar.bind(this, false));

        window.addEventListener('beforeunload', () => {
            this.window.removeListener('maximize', updateIcon);
            this.window.removeListener('unmaximize', updateIcon);
            this.window.removeListener('enter-full-screen', updateTitleBar);
            this.window.removeListener('leave-full-screen', updateTitleBar);
        });

        document.body.appendChild(this.titleBar);

        TitleBar.addWindowBorders();
        this.initiateEventListeners();
    }

    /**
     * Method that attaches Event Listeners for elements
     */
    initiateEventListeners() {
        const hamburgerMenuButton = document.getElementById('hamburger-menu-button');
        const minimizeButton = document.getElementById('title-bar-minimize-button');
        const maximizeButton = document.getElementById('title-bar-maximize-button');
        const closeButton = document.getElementById('title-bar-close-button');

        attachEventListeners(this.titleBar, 'dblclick', this.maximizeOrUnmaximize.bind(this));
        attachEventListeners(hamburgerMenuButton, 'click', this.popupMenu.bind(this));
        attachEventListeners(closeButton, 'click', this.closeWindow.bind(this));
        attachEventListeners(maximizeButton, 'click', this.maximizeOrUnmaximize.bind(this));
        attachEventListeners(minimizeButton, 'click', this.minimize.bind(this));
    }

    /**
     * Method that adds borders
     */
    static addWindowBorders() {
        const borderBottom = document.createElement('div');
        borderBottom.className = 'bottom-window-border';

        document.body.appendChild(borderBottom);
        document.body.classList.add('window-border');
    }

    /**
     * Method that updates the state of the maximize or
     * unmaximize icons
     * @param isMaximized
     */
    static updateIcons(isMaximized) {
        const button = document.getElementById('title-bar-maximize-button');

        if (!button) {
            return
        }

        if (isMaximized) {
            button.innerHTML = htmlContents.unMaximizeButton;
        } else {
            button.innerHTML = htmlContents.maximizeButton;
        }
    }

    /**
     * Method that updates the title bar display property
     * based on the full screen event
     * @param isFullScreen {Boolean}
     */
    static updateTitleBar(isFullScreen) {
        if (isFullScreen) {
            this.titleBar.style.display = 'none';
            updateContentHeight('0px');
        } else {
            this.titleBar.style.display = 'flex';
            updateContentHeight();
        }

    }

    /**
     * Method that popup the application menu
     */
    popupMenu() {
        if (this.isValidWindow()) {
            ipcRenderer.send(apiName, {
                cmd: apiCmds.popupMenu
            });
        }
    }

    /**
     * Method that minimizes browser window
     */
    minimize() {
        if (this.isValidWindow()) {
            this.window.minimize();
        }
    }

    /**
     * Method that maximize or unmaximize browser window
     */
    maximizeOrUnmaximize() {

        if (!this.isValidWindow()) {
            return;
        }

        if (this.window.isMaximized()) {
            this.window.unmaximize();
        } else {
            this.window.maximize();
        }
    }

    /**
     * Method that closes the browser window
     */
    closeWindow() {
        if (this.isValidWindow()) {
            this.window.close();
        }
    }

    /**
     * Verifies if the window exists and is not destroyed
     * @returns {boolean}
     */
    isValidWindow() {
        return !!(this.window && !this.window.isDestroyed());
    }
}

/**
 * Will attach event listeners for a given element
 * @param element
 * @param eventName
 * @param func
 */
function attachEventListeners(element, eventName, func) {

    if (!element || !eventName) {
        return;
    }

    eventName.split(" ").forEach((name) => {
        element.addEventListener(name, func, false);
    });
}

/**
 * Method that adds margin property to the push
 * the client content below the title bar
 * @param height
 */
function updateContentHeight(height = titleBarHeight) {
    const contentWrapper = document.getElementById('content-wrapper');
    const titleBar = document.getElementById('title-bar');

    if (!titleBar) {
        return;
    }

    if (contentWrapper) {
        contentWrapper.style.marginTop = titleBar ? height : '0px';
        document.body.style.removeProperty('margin-top');
    } else {
        document.body.style.marginTop = titleBar ? height : '0px'
    }
}

module.exports = {
    TitleBar,
    updateContentHeight
};