let sunbMenu = document.querySelector(".submenu");
let openSubMenu = document.querySelector(".open_submenu");

openSubMenu.addEventListener("click", function(e){
    e.stopPropagation(); // evita que se cierre de inmediato
    sunbMenu.classList.toggle("show");
});

document.addEventListener("click", function(e){
    if (sunbMenu.classList.contains("show")
        && !sunbMenu.contains(e.target)
        && !openSubMenu.contains(e.target)) {
            
        sunbMenu.classList.remove("show");
    }
});