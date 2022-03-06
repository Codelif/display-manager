function getData(display) {
    for (const i of info) {
        if (i['display'] == display) {
            return i;
        };
    };
}
function gcd (a,b){
    if (b == 0){
        return a
    }
    return gcd (b, a % b)
}
if( typeof Element.prototype.clearChildren === 'undefined' ) {
    Object.defineProperty(Element.prototype, 'clearChildren', {
      configurable: true,
      enumerable: false,
      value: function() {
        while(this.firstChild) this.removeChild(this.lastChild);
      }
    });
}
function updateVariables(){
    let display = displays[document.getElementById("displaySelect").value-1]
    let data = getData(display);
    
    // Brightness Section
    document.getElementById("brightnessRange").value = data['brightness']

    // Scale Section
    document.getElementById("scaleRange").value = data['scale']

    // Orientation Section
    // 1. Rotation
    let rotation = 1
    switch (data['orientation']) {
        case "normal":
            rotation = 1
            break;
        case "right":
            rotation = 2
            break;
        case "inverted":
            rotation = 3
            break;
        case "left":
            rotation = 4
            break;  
        default:
            rotation = 1
            break;
    }
    document.getElementById("rotationSelect").value = rotation
    // 2. Mirroring
    let x = document.getElementById("mirror-horizontal")
    let y = document.getElementById("mirror-vertical")
    switch (data['mirror']) {
        case "normal":
            x.checked = false;
            y.checked = false;
            break;
        case "x":
            x.checked = true;
            y.checked = false;
            break;
        case "y":
            x.checked = false;
            y.checked = true;
            break;
        case "xy":
            x.checked = true;
            y.checked = true;
            break;
    
        default:
            break;
    }
    // Resolution Section
    // 1. Mode and Refresh Rate
    let modeSelect = document.getElementById("modeSelect")
    let rateSelect = document.getElementById("rateSelect")
    let currMode = "";
    let currRate = "";
    modeSelect.clearChildren();
    rateSelect.clearChildren();
    currentOption = 1
    for (let [key, value] of Object.entries(data['modes']['modes'])) {
        // Mode
        let option = document.createElement("option")
        option.value = currentOption;
        let optionText = key;
        // console.log(aspectRatio(optionText))
        if (optionText.includes("i")){
            optionText = optionText.slice(0, optionText.length-1)
            
            optionText += ` (${aspectRatio(optionText)})`;
            optionText += " (Interlaced)"
            
        }else{
            optionText += ` (${aspectRatio(optionText)})`;
        }
        if (data['modes']['rec']['mode'] == key){
            optionText += " (Recommended)";
        }
        if (data["modes"]["cur"]['mode'] == key){
            optionText += " (Current)";
            currMode = currentOption

            rateCurr = 1
            for (const rate of value){
                let roption = document.createElement("option")
                roption.value = rateCurr;
                let roptionText = rate;
                if (data['modes']['rec']['rate'] == rate){
                    roptionText += " (Recommended)";
                }
                if (data["modes"]["cur"]['rate'] == rate){
                    roptionText += " (Current)";
                    currRate = rateCurr;
                }
                roption.innerText = roptionText
                rateCurr++;

                rateSelect.appendChild(roption)
            }
        }
        option.innerText = optionText
        currentOption++;
        modeSelect.appendChild(option)
        
        modeSelect.value = currMode
        rateSelect.value = currRate
        

    }
    function aspectRatio(optionText) {
        const [w, h] = optionText.split("x");
        cd = gcd(w, h);
        return `${w / cd}:${h / cd}`;
    }

    // 2. Primary
    document.getElementById("primary-check").checked = data["primary"]


}

updateVariables()

function updateRates(){
    let modeSelect = document.getElementById("modeSelect")
    let rateSelect = document.getElementById("rateSelect")
    let monitor = document.getElementById("displaySelect")
    monitor = monitor.options[monitor.selectedIndex].innerText
    rateSelect.clearChildren()
    let mode = modeSelect.options[modeSelect.selectedIndex].innerText.split(" ")[0]
    
    const data = getData(monitor);
    let value = data["modes"]["modes"][mode]
    rateCurr = 1
    for (const rate of value){
        let roption = document.createElement("option")
        roption.value = rateCurr;
        let roptionText = rate;
        
        if (data['modes']['rec']['rate'] == rate && data['modes']['rec']['mode'] == mode){
            
            roptionText += " (Recommended)";
        }
        if (data["modes"]["cur"]['rate'] == rate && data['modes']['cur']['mode'] == mode){
            roptionText += " (Current)";
            currRate = rateCurr;
        }
        roption.innerText = roptionText
        rateCurr++;

        rateSelect.appendChild(roption)
    }


}
updateRates()





// var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
// var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
//     return new bootstrap.Tooltip(tooltipTriggerEl);
// });

let scale = document.getElementById("scaleRange")
document.getElementById("scaleout").innerText = parseFloat(scale.value).toFixed(2)+'x'
updateModeOutput()

let bright = document.getElementById("brightnessRange")
document.getElementById("brightout").innerText = Math.round(bright.value*100)+"%"

function changeZeroState(element){
    bright.setAttribute("min", element.checked ? "0" : "0.05")
    document.getElementById("brightout").innerText = Math.round(bright.value*100)+"%"
}

function updateModeOutput(){
    let scale = parseFloat(document.getElementById("scaleRange").value).toFixed(2)
    let mode = document.getElementById("modeSelect")
    let eqElement = document.getElementById("equivMode")
    const [w,h] = mode[mode.value-1].innerText.split(" ")[0].split("x")
    let eqScale = Math.round(w*scale)+"x"+Math.round(h*scale)
    eqElement.innerText = "Equivalent Resolution: " + eqScale
}


// add dummy input for form
var chk = $('input[type="checkbox"]');
chk.each(function(){
    var v = $(this).attr('checked') == 'checked'?1:0;
    $(this).after('<input type="hidden" name="'+$(this).attr('rel')+'" value="'+v+'" />');
});

chk.change(function(){ 
    var v = $(this).is(':checked')?1:0;
    $(this).next('input[type="hidden"]').val(v);
});


var slct = $('select');
slct.each(function(){
    var v = $(this).find(":selected").text();
    $(this).after('<input type="hidden" name="'+$(this).attr('id')+'" value="'+v+'" />');
});
slct.change(function(){ 
    var v = $(this).find(":selected").text();
    $(this).next('input[type="hidden"]').val(v);
});

function onChangeDisplay(){
    var slct = $('select');
    var chk = $('input[type="checkbox"]');

    chk.each(function(){
        var v = $(this).is(':checked')?1:0;
        $(this).next('input[type="hidden"]').val(v);
    })
    slct.each(function(){
        var v = $(this).find(":selected").text();
        $(this).next('input[type="hidden"]').val(v);
    });
}



// ajax form
$( "#dform" ).on( "submit", function(e) {

    var dataString = $(this).serialize();
        
    // alert(dataString); return false;
    
    $.ajax({
        type: "POST",
        url: "/update",
        data: dataString,
        success: function () {
        $("#form-container").not(':first').remove();
        $("#form-container").append("<div id='message' class='mb-3'></div>");
        $("#message")
            .html("<div class=\"alert alert-success\" role=\"alert\">Display settings updated!!<br>Reload to update the changes here.</div>")
            .hide()
            .fadeIn(1000)
            .delay(5000)
            .fadeOut(1000, function (){
            $("#message").remove()
        })
            
        }
    });
    
    e.preventDefault();
    });











/*

// Resolution Section
// 1. Mode and Refresh Rate
let modeSelect = document.getElementById("modeSelect")
let rateSelect = document.getElementById("rateSelect")
modeSelect.clearChildren();
rateSelect.clearChildren();
currentOption = 1
for (let [key, value] of Object.entries(data['modes']['modes'])) {
    // Mode
    let option = document.createElement("option")
    option.value = currentOption;
    let optionText = key;
    if (data['modes']['rec']['mode'] == key){
        optionText += " (Recommended)";
    }
    if (data["modes"]["cur"]['mode'] == key){
        optionText += " (Current)";
        modeSelect.value = currentOption
    }
    option.innerText = optionText
    currentOption++;
    modeSelect.appendChild(option)
    // Rate
    rateCurr = 1
    for (const rate of value){
        let option = document.createElement("option")
        option.value = rateCurr;
        let optionText = rate;
        if (data['modes']['rec']['rate'] == rate){
            optionText += " (Recommended)";
        }
        if (data["modes"]["cur"]['rate'] == rate){
            optionText += " (Current)";
            rateSelect.value = rateCurr;
        }
        option.innerText = optionText
        rateCurr++;

        rateSelect.
    }
*/

