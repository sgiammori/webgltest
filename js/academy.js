var initWebGL = function (){
    var gl;
    var canvas = document.getElementById('my-canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    try{
        //il tipo del ctx definisce l'API con cui posso disegnare sul canvas
        gl = canvas.getContext('experimental-webgl', { antialias : true });
    }catch (e) { }
    if(gl){
        var shader_vertex_source="\n\
            attribute vec3 position;\n\
            uniform mat4 Pmatrix;\n\
            uniform mat4 Vmatrix;\n\
            uniform mat4 Mmatrix;\n\
            attribute vec3 color; //the color of the point\n\
            varying vec3 vColor;\n\
            void main(void) { //pre-built function\n\
                gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);\n\
                vColor=color;\n\
            }";

        var shader_fragment_source="\n\
            precision mediump float;\n\
            varying vec3 vColor;\n\
            void main(void) {\n\
                gl_FragColor = vec4(vColor, 1.);\n\
            }";

        //function to compile a shader
        var get_shader=function(source, type, typeString) {
            var shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
              alert("ERROR IN "+typeString+ " SHADER : " + gl.getShaderInfoLog(shader));
              return false;
            }
            return shader;
        };

        //compile shaders
        var shader_vertex=get_shader(shader_vertex_source, gl.VERTEX_SHADER, "VERTEX");
        var shader_fragment=get_shader(shader_fragment_source, gl.FRAGMENT_SHADER, "FRAGMENT");

        //program creation and shaders linking
        var SHADER_PROGRAM=gl.createProgram();
        gl.attachShader(SHADER_PROGRAM, shader_vertex);
        gl.attachShader(SHADER_PROGRAM, shader_fragment);
        gl.linkProgram(SHADER_PROGRAM);

        var _Pmatrix = gl.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
        var _Vmatrix = gl.getUniformLocation(SHADER_PROGRAM, "Vmatrix");
        var _Mmatrix = gl.getUniformLocation(SHADER_PROGRAM, "Mmatrix"); //link MMatrix to a js var

        //vertex buffer slot indexes
        var _position = gl.getAttribLocation(SHADER_PROGRAM, "position");
        var _color = gl.getAttribLocation(SHADER_PROGRAM, "color");
        gl.enableVertexAttribArray(_position);
        gl.enableVertexAttribArray(_color);

        //use the program
        gl.useProgram(SHADER_PROGRAM);

        /*========================= THE TRIANGLE ========================= */
        //POINTS
        var triangle_vertex=[
         -1, -1,  0,  //first summit -> bottom left of the viewport
          0,  0,  1,  //first summit color -> blu
          1, -1,  0,  //bottom right of the viewport
          1,  1,  0,  //second summit color -> giallo
          1,  1,  0,  //top right of the viewport
          1,  0,  0   //third summit color -> rosso
        ];
        //prepare the POINTS buffer
        var TRIANGLE_VERTEX= gl.createBuffer ();
        gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangle_vertex), gl.STATIC_DRAW);

        //FACES (== indexes)
        var triangle_faces = [0,1,2];
        //prepare the FACES buffer
        var TRIANGLE_FACES= gl.createBuffer ();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangle_faces), gl.STATIC_DRAW);

        /*========================= MATRIX ========================= */

        //40 = angle camera, camera show only pixels between zmin e zmax
        var PROJMATRIX=LIBS.get_projection(40, canvas.width/canvas.height, 1, 100);
        var MOVEMATRIX=LIBS.get_I4(); //init to identity matrix
        var VIEWMATRIX=LIBS.get_I4();

        LIBS.translateZ(VIEWMATRIX, -5);

        /*========================= DRAWING ========================= */

        gl.clearColor(0.0, 0.0, 0.0, 0.0); //set the clear value for the color buffer to white
        gl.enable(gl.DEPTH_TEST); //enable the depth buffer
        gl.depthFunc(gl.LEQUAL); //set the comparison function
        gl.clearDepth(1.0); //set the clear value for the depth buffer to 1.0

        var time_old=0;
        var animate=function(time) { //window.requestAnimationFrame sends a timestamp as an argument
          var dAngle=time-time_old;
          LIBS.rotateZ(MOVEMATRIX, dAngle*0.005);
          LIBS.rotateY(MOVEMATRIX, dAngle*0.004);
          LIBS.rotateX(MOVEMATRIX, dAngle*0.003);
          time_old=time;

          gl.viewport(0.0, 0.0, canvas.width, canvas.height);
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); //clear color and depth buffers
          gl.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
          gl.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
          gl.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX); //send mmatrix to the shaders
          gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX); //set triangle buffer
          //_pos = slot index, 3 elements per time, type of elements, ?, stride = ogni 6 elementi (ogni elemento è un float di 32bit, quindi 4 byte per elemento), offset = byte 0
          gl.vertexAttribPointer(_position, 3, gl.FLOAT, false, (3+3) * 4, 0);
          // ... , dal quarto elemento (dopo il terzo elemento)
          gl.vertexAttribPointer(_color, 3, gl.FLOAT, false, (3+3) * 4, 3 * 4) ;
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES);
          gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 0); //draw the triangle

          //draw finished : now show the render
          gl.flush();

          //redraw the scene as soon is ready
          window.requestAnimationFrame(animate);

        };

        animate(0); //first call to animate will be done with time equals to 0

    }else{
        alert("Your browser does not support webgl") ;
    }
};