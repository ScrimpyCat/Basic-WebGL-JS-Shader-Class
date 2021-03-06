Basic-WebGL-JS-Shader-Class
===========================

A basic template for a shader class that exposes attributes and uniforms from the compiled GLSL program as properties of that JS object. The code is designed for you to add your own setters for the different uniforms, so you can use whatever vector and matrix library your prefer (or your own code), or whatever else you have that represents those things/can be converted to the float array.

Example usage:
---
    <script id="shader-vs" type="x-shader/x-vertex">
        uniform mat4 projectionMatrix;
        attribute vec4 vertex;
        
        void main()
        {
            gl_Position = projectionMatrix * vertex;
        }
    </script>
    
    <script id="shader-fs" type="x-shader/x-fragment">
        uniform struct _blah {
            highp float bar[3];
            highp vec4 fun;
        } foo[2];
        
        void main()
        {
            gl_FragColor = vec4(foo[0].bar[0], foo[0].bar[1], foo[0].bar[2], 1.0) * vec4(foo[1].bar[0], foo[1].bar[1], foo[1].bar[2], 1.0) * foo[1].fun;
        }
    </script>
    
    var test = new Shader("shader-vs","shader-fs");
    gl.useProgram(test.program);
    test.uniforms.projectionMatrix = Matrix.ortho(0,canvas.width,0,canvas.height,0,1);
    test.uniforms.foo[0].bar[0] = 0.6;
    test.uniforms.foo[0].bar[1] = 0.3;
    test.uniforms.foo[0].bar[2] = 1;
    test.uniforms.foo[1].bar[0] = 0.6;
    test.uniforms.foo[1].bar[1] = 0.3;
    test.uniforms.foo[1].bar[2] = 1;
    test.uniforms.foo[1].fun = new Vector(1,0,0,1);
    
    //and an example of referencing the attribute
    gl.enableVertexAttribArray(test.attributes.vertex);

Example uniform setter:
---
    case gl.FLOAT:
    setUniform = function(location, oldValue, newValue){
        if (oldValue != newValue)
        {
            oldValue = newValue;
            gl.uniform1f(location, newValue);
        }
        
        return oldValue;
    };
                        
    initValue = 0;
    break;

    case gl.FLOAT_VEC2:
    setUniform = function(location, oldValue, newValue){
        if (oldValue.isEqual(newValue) == false)
        {
            oldValue = new Vector(newValue);
            gl.uniform2fv(location, newValue.toFloat32Array());
        }
        
        return oldValue;
    };
    
    initValue = new Vector(0,0);
    break;

    //alternatively you might decide to not care about redundant uniform sets, or you'll be watching for them somewhere else so the simplest form it can take is as follows
    case gl.INT:
    setUniform = function(location, oldValue, newValue){
        gl.uniform1i(location, newValue);
        return newValue;
    };
                        
    initValue = 0;
    break;