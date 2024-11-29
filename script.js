// let pencilElement = document.querySelector("#pencil");
// let eraserElement = document.querySelector("#eraser");
// let stickyElement = document.querySelector("#sticky");
// let uploadElement = document.querySelector("#upload");
// let downloadElement = document.querySelector("#download");
// let undoElement = document.querySelector("#undo");
// let redoElement = document.querySelector("#redo");

let canvas = document.querySelector("#board");
canvas.height = window.innerHeight; /*Inner height means excluding the toolbar and scroller*/
canvas.width = window.innerWidth; /*(window is the browser window)*/

let tool = canvas.getContext("2d"); /*The getContext() method returns an object with tools (methods) for drawing. 2d, cause we draw in 2d*/
//canvas ka jo bhi kaam hoga, wo tool karega.
//using the tool we made above, we can perform various actions for drawing.

let toolsArr = document.querySelectorAll(".tool"); //instead of giving one variable to each element, we kinda added all in one.
let currentTool = "pencil";
tool.lineWidth = 3;
for(let i = 0; i < toolsArr.length; i++){
    toolsArr[i].addEventListener("click", function(){
        const toolName = toolsArr[i].id; //as we set id as the actual name of the element in html.
        if(toolName == "pencil"){
            currentTool = "pencil";
            tool.lineWidth = 3;
            tool.strokeStyle = "pink";
        }
        else if(toolName == "eraser"){
            currentTool = "eraser";
            tool.strokeStyle = "white"; 
            tool.lineWidth = 20;
            
        }
        else if(toolName == "sticky"){
            currentTool = "sticky";
            createSticky(); //call this function when sticky is selected.   
        }
        else if(toolName == "upload"){
            currentTool = "upload";
            uploadFile();
            
        }
        else if(toolName == "download"){
            currentTool = "download";
            downloadFile();
            
        }
        else if(toolName == "undo"){
            currentTool = "undo";
            undoFN();
            
        }
        else if(toolName == "redo"){
            currentTool = "redo";
            redoFN();
            
        }
        else if(toolName == "clear"){
            currentTool = "clear";
            clearAll();
        }

       
    })

}

//******************************************** */
let undoStack = []; 
let redoStack = [];
let isDrawing = false;

//********Pencil*********** */
canvas.addEventListener("mousedown", function(e){
    isDrawing = true;
    tool.beginPath();
    // let sidx = e.clientX;  //returns the horizontal client coordinate of the mouse pointer when a mouse event occurs.
    // let sidy = e.clientY; //start index Y (clientX & clientY are w.r.t. to screen size)
    // let toolBarHeight = getYaxis();
    // tool.moveTo(sidx,sidy-toolBarHeight);
    // isDrawing = true;
    // let pointDesc = { //we are just storing the points where we do mouse down
    //     x: sidx,
    //     y: sidy - toolBarHeight,
    //     desc: "md" //mouse down
    // }

    let rect = canvas.getBoundingClientRect(); // Get canvas position and size
    let sidx = e.clientX - rect.left; // Adjust X-coordinate
    let sidy = e.clientY - rect.top;  // Adjust Y-coordinate
    tool.moveTo(sidx, sidy);
    isDrawing = true;

    let pointDesc = {
        x: sidx,
        y: sidy,
        desc: "md", // mouse down
    };
    //last mei add kar diya
    undoStack.push(pointDesc);
})

canvas.addEventListener("mousemove", function(e){
    if(isDrawing == false)return;
    // let eidx = e.clientX;
    // let eidy = e.clientY;
    // let toolBarHeight = getYaxis();
    // tool.lineTo(eidx, eidy - toolBarHeight); //(moveTo and lineTo are acc to canvas size)
    // tool.stroke();
    // let pointDesc = {
    //     x: eidx,
    //     y:eidy - toolBarHeight,
    //     desc : "mm" //mouse move
    // }
    let rect = canvas.getBoundingClientRect(); // Get canvas position and size
    let eidx = e.clientX - rect.left; // Adjust X-coordinate
    let eidy = e.clientY - rect.top;  // Adjust Y-coordinate
    tool.lineTo(eidx, eidy);
    tool.stroke();

    let pointDesc = {
        x: eidx,
        y: eidy,
        desc: "mm", // mouse move
    };
    undoStack.push(pointDesc);
})

canvas.addEventListener("mouseup", function(e){
    isDrawing = false;
})

let toolbar = document.querySelector(".toolbar");

function getYaxis(){  //Helper function
    let heightOfToolBar = toolbar.getBoundingClientRect().height; //gives properties of that element(of a rectangle). We need height of the toolbox.
    return heightOfToolBar;
}

// we did all this y axis stuff because whenever we were making a line,
//it was getting drawn below where we wanted. Because of difference of 
//clientxy and moveTo lineTo. 

//************************************ */

//strokeStyle gives colour
//linewidth gives the width of the line


//problem here!!!
function createOuterShell(textArea){ // dividing the common logic of outer shell(having cross and minimise icon) required for both image and sticky note
    let stickyDiv = document.createElement("div");
    let navDiv = document.createElement("div");
    let closeDiv = document.createElement("div");
    let minimizeDiv = document.createElement("div");
    


    stickyDiv.setAttribute("class","sticky"); //all the styling we did for sticky will also be applied to stickyDiv
    navDiv.setAttribute("class","nav");
    
   

    //stickydiv contains nav and textarea as well. So we append them to make a tree like structure.

    // closeDiv.innerText = "x";
    // minimizeDiv.innerText = "min";

    let minimizeIcon = document.createElement("img");
    minimizeIcon.src = "./NewIcons/green-minimize.svg";
    minimizeIcon.alt = "Minimize";
    minimizeIcon.style.height = "11px"; // Adjust size as needed
    minimizeDiv.appendChild(minimizeIcon);

    // Create and set close icon
    let closeIcon = document.createElement("img");
    closeIcon.src = "./NewIcons/red-cross.svg";
    closeIcon.alt = "Close";
    closeIcon.style.height = "12.5px"; // Adjust size as needed
    closeDiv.appendChild(closeIcon);

    stickyDiv.appendChild(navDiv);
    navDiv.appendChild(minimizeDiv);
    navDiv.appendChild(closeDiv);
//***down 2 lines change by chatgpt */
    stickyDiv.style.top = `${getYaxis() + 10}px`;
    stickyDiv.style.left = `40vw`;
//******** */
    document.body.appendChild(stickyDiv); //added it to the page

    closeDiv.addEventListener("click", function(){ //closing the sticky note
        stickyDiv.remove();
    })

    let isMinimized = false;
    //now we are minimizing the sticky note
    minimizeDiv.addEventListener("click",function(){  //problem in text area here!!!!
        isMinimized = !isMinimized; //reversed the value of true/false whenever it's clicked
        // if(isMinimized){
        //     //means it was minimized and then we clicked on it, means it should open.
        //     textArea.style.display = "none"; //block means show it
        // }
        // else{
        //     textArea.style.display = "block"; //only the text area goes away when we minimize the sticky note
        // }

        const children = stickyDiv.children;
    for (let i = 1; i < children.length; i++) {
        children[i].style.display = isMinimized ? "none" : "block"; // Toggle visibility of all child elements except nav
    }

    
    })

    //Now we have to make the sticky note move when we drag it around.

    //************Moving it**************** */
    let isStickyDown = false;

    navDiv.addEventListener("mousedown",function(e){
        //taking the initial points when just pressed on the sticky note
        initialX = e.clientX;
        initialY = e.clientY;
        isStickyDown = true;
    })

    navDiv.addEventListener("mousemove",function(e){
        if(isStickyDown==true){ //to check if the mouse has been pressed or not
            //final points
            let finalX = e.clientX;
            let finalY = e.clientY;
            
            //distance
            let dx = finalX - initialX;
            let dy = finalY - initialY;

            let{ top, left } = stickyDiv.getBoundingClientRect(); //the current top and left of the sticky note
            //adding the distance calculated into the current coordinates
            stickyDiv.style.top = top + dy + "px"; 
            stickyDiv.style.left = left + dx + "px";
            initialX = finalX; //setting
            initialY = finalY;

        }

    })

    navDiv.addEventListener("mouseup", function(){
        isStickyDown = false;
    })

    return stickyDiv;

    //************************** */

}

function createSticky(){ //full correct
    // <div class="sticky"> //took this code just for reference for the createElement parts
    //         <div class="nav">
    //             <div class="close">x</div>
    //             <div class="minimize">min</div>
    //         </div>
    //         <textarea class = "text-area"></textarea>
    //     </div>
    let textArea = document.createElement("textarea"); //correct
    textArea.setAttribute("class","text-area"); //correct
    let stickyDiv = createOuterShell(textArea);
    stickyDiv.appendChild(textArea);
    
}

//uploading a picture
let inputTag = document.querySelector(".input-tag");
function uploadFile(){ //fully correct
    inputTag.click(); //able to click directly with javaScript using this function. 
    //no file has been selected till now, just a click has happened on upload icon.
    //so we put an event listener to see when we slect a file.
    
    inputTag.addEventListener("change", function(){ //change event will be called jab data aa chuka hoga
        let data = inputTag.files[0]; //files[0] has all the content abt whatever we selected
        let img = document.createElement("img"); // we made an image element
        let url = URL.createObjectURL(data); //got the url of the image through an in-built function
        img.src = url; 
        img.setAttribute("class","upload-img");

        let stickyDiv = createOuterShell();
        stickyDiv.appendChild(img);
        
    })
    


}

function downloadFile(){
    //create anchor button
    let a = document.createElement("a");
    //set file name to it's download attribute
    a.download = "file.jpeg";
    //convert the canvas board to url
    let url = canvas.toDataURL("image/jpeg;base64");
    //set href of anchor
    a.href = url;
    //click the anchor
    a.click();
    a.remove();
}

function redraw(){
    
    for(let i = 0; i < undoStack.length; i++){
        let { x, y, desc} = undoStack[i];
        if(desc == "md"){
            tool.beginPath();
            tool.moveTo(x,y);
        }
        else if(desc == "mm"){
            tool.lineTo(x, y);
            tool.stroke();
        }

    }
}

function undoFN(){
    //canvas doesn't give an inbuilt function for undo. So we use ClearRect function.
    //we store the points of the mouse down and mouse move, remove the last point, clean the slate and redraw.

    //clear screen 
    //pop
    if(undoStack.length > 0){
        // undoStack.pop();
        tool.clearRect(0,0,canvas.width,canvas.height);
        redoStack.push(undoStack.pop()); //whatever goes out of the undo stack goes into the redo stack.
        redraw();

    }
}

function redoFN(){
    if(redoStack.length > 0){
        tool.clearRect(0,0,canvas.width,canvas.height);
        undoStack.push(redoStack.pop());
        redraw();
    }
}


function clearAll(){
    tool.clearRect(0,0,canvas.width,canvas.height);
}

// document.addEventListener('mousemove', function(event) { //for the mouse pointer
//     const pointer = document.getElementById('myPointer');
//     pointer.style.left = event.clientX + 'px'; 
//     pointer.style.top = event.clientY + 'px'; 
//   });

