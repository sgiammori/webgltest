
var v = window;
window.onload = initWebGL;
var gl = null, canvas = null;
var fS = null, vS = null; //shaders : fragment shader e vertex shader
var glProgram = null; //linka vS al fS
var vertexPosAttribute = null, vertexColAttribute = null;
var triangleVertBuffer = null, triangleColBuffer = null;

function initWebGL(){
    canvas = document.getElementById('my-canvas');
    //canvas.width = document.innerWidth;
    //canvas.height = document.innerHeight;
    try{
        //il tipo del ctx definisce l'API con cui posso disegnare sul canvas
        gl = canvas.getContext('experimental-webgl');
    }catch (e) { }
    if(gl){
        setupWebGL();
        initShaders();
        setupBuffers();
        drawScene();
    }else{
        alert("Your browser does not support webgl") ;
    }
};

function setupWebGL(){
    gl.clearColor(1.0,0.0,0.0,1.0); //set the backgroung color to red
    gl.clear(gl.COLOR_BUFFER_BIT); //clean the color buffer == apply the color red
};

function initShaders(){
    //get shaders source
    var vsSource = document.getElementById('vShader').innerHTML;
    var fsSource = document.getElementById('fShader').innerHTML;
    //compile shaders
    vS = makeShader(vsSource, gl.VERTEX_SHADER);
    fS = makeShader(fsSource, gl.FRAGMENT_SHADER);
    //create program
    glProgram = gl.createProgram();
    //attach and link shaders to the program
    gl.attachShader(glProgram, vS);
    gl.attachShader(glProgram, fS);
    gl.linkProgram(glProgram);
    if(!gl.getProgramParameter(glProgram, gl.LINK_STATUS))
        alert('Unable to init the shader program');
    else
        gl.useProgram(glProgram);
};

function makeShader(src, type){
    //compile the shader
    var shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        alert('Error compiling shader : '+gl.getShaderInfoLog(shader));
    return shader;
}

function setupBuffers(){

    //prepare the vertex buffer object of the vertices

    var triangleVertices = [
        //left triangle
        -0.5,  0.5, 0.0,
         0.0,  0.0, 0.0,
        -0.5, -0.5, 0.0,
        //right triangle
         0.5,  0.5, 0.0,
         0.0,  0.0, 0.0,
         0.5, -0.5, 0.0
    ];

    triangleVertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertBuffer);
    //allocazione su GPU della memoria per i miei dati (before this must be binded the relative buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

    //prepare the vertex buffer object of the colors

    var triangleVerticesColor = [
            //left triangle
            1.0, 0.0, 1.0,
            1.0, 1.0, 1.0,
            1.0, 0.0, 0.0,
            //right triangle
            0.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            0.0, 0.0, 1.0
        ];

    triangleColBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleColBuffer);
    //allocazione su GPU della memoria per i miei dati (before this must be binded the relative buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVerticesColor), gl.STATIC_DRAW);
};

function drawScene(){
    vertexPosAttribute = gl.getAttribLocation(glProgram, "aVertexPosition");
    gl.enableVertexAttribArray(vertexPosAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertBuffer);
    //must be binded the relative vertices buffer before call vertexAttribPointer
    gl.vertexAttribPointer(vertexPosAttribute, 3, gl.FLOAT, false, 0, 0);

    vertexColAttribute = gl.getAttribLocation(glProgram, "aVertexColor");
    gl.enableVertexAttribArray(vertexColAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleColBuffer);
    //must be binded the relative vertices_color buffer before call vertexAttribPointer
    gl.vertexAttribPointer(vertexColAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
};