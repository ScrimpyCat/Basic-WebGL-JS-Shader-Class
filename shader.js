Shader.compile = function(id){
    var script = document.getElementById(id);
    if (!script) return null;
    
    var src = script.innerHTML;
    
    var type;
    switch (script.type)
    {
        case "x-shader/x-fragment":
            type = gl.FRAGMENT_SHADER;
            break;
            
        case "x-shader/x-vertex":
            type = gl.VERTEX_SHADER;
            break;
            
        default:
            return null;
            break;
    }
    
    var shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    {
        console.log("Compile Failed: " + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    
    return shader;
};

function Shader(vert,frag)
{
    var vertIsString = vert.constructor == String, fragIsString = frag.constructor == String;
    
    if (vertIsString)
    {
        vert = Shader.compile(vert);
    }
    
    if (fragIsString)
    {
        frag = Shader.compile(frag);
    }
    
    
    var program = gl.createProgram();
    this.program = program;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    {
        console.log("Linking Failed: " + gl.getProgramInfoLog(program));
        gl.detachShader(program, vert);
        gl.detachShader(program, frag);
        gl.deleteProgram(program);
    }
    
    
    var programInUse = gl.getParameter(gl.CURRENT_PROGRAM);
    gl.useProgram(program);
    
    var active;
    
    active = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    if (active > 0)
    {
        var attributes = {}, attributesData = {};
        this.attributes = attributes, this.attributesData = attributesData;
        
        this.attribute = function(attrib){
            if (attrib.constructor == String)
            {
                return this.attributesData[attrib];
            }
        };
        
        this.attributeLocation = function(attrib, location){
            if (attrib.constructor == String)
            {
                if (this.attributeData[attrib] != location)
                {
                    this.attributesData[attrib] = location;
                    gl.bindAttribLocation(this.program, location, attrib);
                }
            }
        };
        
        Object.defineProperty(attributes, 0, {
                              value: this,
                              enumerable: false
                              });
        
        for (var i = 0; i < active; i++)
        {
            var info = gl.getActiveAttrib(program, i);
            Object.defineProperty(attributes, info.name, {
                                  enumerable: true,
                                  get: new Function("return this[0].attribute(\"" + info.name + "\");"),
                                  set: new Function("location", "this[0].attributeLocation(\"" + info.name + "\", location);")
                                  });
            Object.defineProperty(attributesData, info.name, {
                                  value: gl.getAttribLocation(program, info.name),
                                  enumerable: true,
                                  writable: true
                                  });
        }
    }
    
    
    active = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    if (active > 0)
    {
        var uniforms = {}, uniformsData = {};
        this.uniforms = uniforms, this.uniformsData = uniformsData;
        
        Object.defineProperty(uniforms, 0, {
                              value: this,
                              enumerable: false
                              });
        
        for (var i = 0, arrays = 0; i < active; i++)
        {
            var info = gl.getActiveUniform(program, i);
            
            var structures = info.name.split(".");
            var activeComponent = uniforms;
            var dataComponent = uniformsData;
            for (var l = 0, length = structures.length - 1; l < length; l++)
            {
                var current = structures[l];
                var arrayIndex = undefined;
                if (current[current.length - 1] == "]")
                {
                    var arrayedString = current.slice(0, -1).split("[");
                    current = arrayedString[0];
                    arrayIndex = arrayedString[1];
                }
                
                if (Object.getOwnPropertyNames(activeComponent).indexOf(current) == -1)
                {
                    var member = {};
                    Object.defineProperty(activeComponent, current, {
                                          value: member,
                                          enumerable: true
                                          });
                    Object.defineProperty(member, (arrayIndex != undefined)? "_" : 0, {
                                          value: this,
                                          enumerable: false
                                          });
                    
                    Object.defineProperty(dataComponent, current, {
                                          value: {},
                                          enumerable: true
                                          });
                }
                
                activeComponent = activeComponent[current];
                dataComponent = dataComponent[current];
                
                if (arrayIndex != undefined)
                {
                    if (Object.getOwnPropertyNames(activeComponent).indexOf(arrayIndex) == -1)
                    {
                        var member = {};
                        Object.defineProperty(activeComponent, arrayIndex, {
                                              value: member,
                                              enumerable: true
                                              });
                        Object.defineProperty(member, 0, {
                                              value: this,
                                              enumerable: false
                                              });
                        
                        Object.defineProperty(dataComponent, arrayIndex, {
                                              value: {},
                                              enumerable: true
                                              });
                    }
                    
                    activeComponent = activeComponent[arrayIndex];
                    dataComponent = dataComponent[arrayIndex];
                }
            }
            
            /*
             uniform setters template:
             setUniform = function(location, oldValue, newValue) return current value
             initValue = set it to whatever is representative of the intialized value (so either 0 or false)
             */
            var setUniform, initValue;
            switch (info.type)
            {
                case gl.FLOAT:
                    break;
                    
                case gl.FLOAT_VEC2:
                    break;
                    
                case gl.FLOAT_VEC3:
                    break;
                    
                case gl.FLOAT_VEC4:
                    break;
                    
                case gl.INT:
                    break;
                    
                case gl.INT_VEC2:
                    break;
                    
                case gl.INT_VEC3:
                    break;
                    
                case gl.INT_VEC4:
                    break;
                    
                case gl.BOOL:
                    break;
                    
                case gl.BOOL_VEC2:
                    break;
                    
                case gl.BOOL_VEC3:
                    break;
                    
                case gl.BOOL_VEC4:
                    break;
                    
                case gl.FLOAT_MAT2:
                    break;
                    
                case gl.FLOAT_MAT3:
                    break;
                    
                case gl.FLOAT_MAT4:
                    break;
                    
                case gl.SAMPLER_2D:
                case gl.SAMPLER_CUBE:
                    break;
            }
            
            
            if (info.size > 1)
            {
                var arrayedString = structures[structures.length - 1].slice(0, -1).split("[");
                var current = arrayedString[0];
                var arrayIndex = arrayedString[1];
                
                var member = {};
                Object.defineProperty(activeComponent, current, {
                                      value: member,
                                      enumerable: true
                                      });
                Object.defineProperty(member, "_", {
                                      value: this,
                                      enumerable: false
                                      });
                
                Object.defineProperty(dataComponent, current, {
                                      value: {},
                                      enumerable: true
                                      });
                activeComponent = activeComponent[current];
                dataComponent = dataComponent[current];
                
                
                var name = info.name.slice(0, info.name.lastIndexOf("["));
                var path = ("this._.uniformsData." + name);
                
                for (var s = 0; s < info.size; s++)
                {
                    var location = gl.getUniformLocation(program, name + "[" + s + "]");
                    Object.defineProperty(activeComponent, s, {
                                          enumerable: true,
                                          get: new Function("return "+ path + "[" + s + "];"),
                                          set: new Function("newValue", path + "[" + s + "]" + "=" + path + ".$func" + s + "(" + path + ".$loc" + s + "," + path + "[" + s + "], newValue)")
                                          });
                    Object.defineProperty(dataComponent, s, {
                                          value: initValue,
                                          enumerable: true,
                                          writable: true
                                          });
                    Object.defineProperty(dataComponent, "$loc" + s, {
                                          value: location,
                                          enumerable: false,
                                          writable: false
                                          });
                    Object.defineProperty(dataComponent, "$func" + s, {
                                          value: setUniform,
                                          enumerable: false,
                                          writable: false
                                          });
                }
            }
            
            else
            {
                var location = gl.getUniformLocation(program, info.name);
                var separate = ("this[0].uniformsData." + info.name).split(/\.(?!.*\.)/);
                Object.defineProperty(activeComponent, structures[structures.length - 1], {
                                      enumerable: true,
                                      get: new Function("return this[0].uniformsData." + info.name + ";"),
                                      set: new Function("newValue", "this[0].uniformsData." + info.name + "=" + separate[0] + ".$func" + separate[1] + "(" + separate[0] + ".$loc" + separate[1] + "," + "this[0].uniformsData." + info.name + ", newValue)")
                                      });
                Object.defineProperty(dataComponent, structures[structures.length - 1], {
                                      value: initValue,
                                      enumerable: true,
                                      writable: true
                                      });
                Object.defineProperty(dataComponent, "$loc" + structures[structures.length - 1], {
                                      value: location,
                                      enumerable: false,
                                      writable: false
                                      });
                Object.defineProperty(dataComponent, "$func" + structures[structures.length - 1], {
                                      value: setUniform,
                                      enumerable: false,
                                      writable: false
                                      });
            }
        }
    }
    
    if (vertIsString)
    {
        gl.deleteShader(vert);
    }
    
    if (fragIsString)
    {
        gl.deleteShader(frag);
    }
}
