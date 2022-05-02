$(".sym").on('click', function(e) {

    const id = e.target.id;
    var selected = ($("#"+id).css("background-color") === "rgb(26, 19, 47)") ? true : false;
    if(selected)
    { 
        $("#"+id).css("background-color","#C4C4C4");
        selected = false;
    }
    else{
        $("#"+id).css("background-color","#1A132F");
    }
    
})


var flipped = false;
$(".toggleIcon").on("click", function(){
    if(!flipped){
        document.querySelector(".navBar").classList.add("responsive");
        document.querySelector(".navBar").classList.remove("navBar");
        flipped = true;
    }
    else{
        document.querySelector(".responsive").classList.add("navBar");
        document.querySelector(".responsive").classList.remove("responsive");
        flipped = false;
    }
})

$("#Symtoms").on("click",function(){
    if(sym.length==0)
    {
        alert("Select At least One Symptom");
        $("#Symtoms").css("a","#");
    }
})