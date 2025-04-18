var typed = new Typed(".input", {
    strings: ["Web Designer.", "Web Developer.", "Software Engineer.", "Editor."],
    typeSpeed: 130,
    backSpeed: 80,
    loop: true
});

let menu = document.querySelector('#menu-icon');
let menuList = document.querySelector('.menulist');  // ✅ fixed

menu.onclick = () => {
    menu.classList.toggle('bx-x');        // for animating the icon
    menuList.classList.toggle('open');    // ✅ toggle the menu visibility
};
