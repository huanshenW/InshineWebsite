var recs = document.querySelectorAll(".thumbnail");

init();

function init(){
    setupRecs();
}

function setupRecs(){
    var clickTime = document.querySelectorAll(".hid-input");
    console.log(clickTime);
    for (var i = 0; i < recs.length; i++) {
        recs[i].i = i;
        recs[i].addEventListener("click", function(i){
            this.classList.toggle("checked");
            
            if (clickTime[this.i].value === "Absent") {
                clickTime[this.i].value = String(new Date());
            } else {
                clickTime[this.i].value = "Absent";
            }
        });
    }
}
