var container;
var zoom;
var rootData;

$(document).ready(function() {
    if (data.Status === 200) {
        //$('#no_data').hide();
        rootData = data.Result.Node;
        console.log(data.Result);
        traverseTreeId(rootData);
        draw(rootData);
    } else {
        // $('#no_data').show();
    }
    //getData();
    selectChange();
});



function selectChange() {
    $("#mao-select").on("change", function() {
        traverseLevel(rootData, $(this).val(), 2);
        drawTree(rootData);
    });

    $("#mao-select-gudong").on("change", function() {
        traverseLevel(rootData, $(this).val(), 3);
        drawTree(rootData);
    });
}

/*  function getData(){
      $('#load_data').show();  
      var url = INDEX_URL+"cms_map";      
      $.ajax({
          url:url,
          type: 'GET',
          data:{ 
              keyNo:getQueryString("keyNo"),
              upstreamCount:4,
              downstreamCount:4
          }, 
          dataType: 'JSON',
          success: function (data){
              $('#load_data').hide();
              if(data.Status === 200){
                  $('#no_data').hide();
                  rootData = data.Result.Node;
                  traverseTreeId(rootData);
                  draw(rootData);
              }else{
                  $('#no_data').show();
              }
          }
      });
  }*/

window.onresize = function() {
    $('#main').width(document.body.clientWidth);
    d3.select('svg').attr('width', document.body.clientWidth)
    if (document.body.clientHeight > 700) {
        $('#main').height(document.body.clientHeight - 66);
        d3.select('svg').attr('height', document.body.clientHeight - 66)
    } else {
        $('#main').height(640);
        d3.select('svg').attr('height', 640);

    }
}

function maoScale(type) {

    var scale = zoom.scale();
    if (type == 1) {
        scale += 0.3;
    } else if (type == 2) {
        scale -= 0.3;
    }
    if (scale >= 0.3 && scale <= 2) {
        zoom.scale(scale);
        container.transition().duration(500).attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")");
    }
}

function maoRotate(type) {


}

function maoRefresh() {

    draw(rootData);
}

function saveImg() {
    jietu('main');
}


function jietu(svgDivId) {
    var jietuMask = document.createElement("div");
    $(jietuMask).attr('style', 'position: fixed; background: #fff; z-index: 1000; top: 0px; bottom: 0px; left: 0px; right: 0px;');
    document.body.appendChild(jietuMask);


    var _svgWidth = d3.select('svg').attr('width');
    var _svgHeight = d3.select('svg').attr('height');
    var _scale = zoom.scale();
    var _translate = zoom.translate();

    zoom.scale(1.5);
    zoom.translate([3264 / 2, 2448 / 2]);
    container.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")");
    d3.select('svg').attr('width', 3264);
    d3.select('svg').attr('height', 2448);

    var svgXml = $('#' + svgDivId).html();
    var image = new Image();
    image.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svgXml)));
    setTimeout(function() {
        var canvas = document.createElement('canvas'); //准备空画布
        canvas.width = $('#' + svgDivId + ' svg').width();
        canvas.height = $('#' + svgDivId + ' svg').height();

        zoom.scale(_scale);
        zoom.translate(_translate);
        container.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")");
        d3.select('svg').attr('width', _svgWidth);
        d3.select('svg').attr('height', _svgHeight);
        $(jietuMask).css('display', 'none');


        var context = canvas.getContext('2d'); //取得画布的2d绘图上下文
        context.drawImage(image, 0, 0);
        var marker = '企业图谱由flyku生成。企业图谱由flyku生成。企业图谱由flyku生成';
        context.font = "30px 微软雅黑";
        context.fillStyle = "#aaaaaa";
        context.fillText(marker, canvas.width / 2 - context.measureText(marker).width / 2, canvas.height - 100);
        download(canvas, 'jpg');
    }, 100);
}

function draw(root) {
    tree = d3.layout.cluster()
        .size([360, 600])
        .separation(function(a, b) {
            return (a.parent == b.parent ? 2 : 3) / a.depth;
        });
    $("#main").empty();
    svg = d3.select("#main").append("svg").attr("xmlns", "http://www.w3.org/2000/svg").attr("style", "background:#fff;");
    svg.empty();
    $('#main').width(document.body.clientWidth);
    d3.select('svg').attr('width', document.body.clientWidth)
    if (document.body.clientHeight > 700) {
        $('#main').height(document.body.clientHeight - 66);
        d3.select('svg').attr('height', document.body.clientHeight - 66)
    } else {
        $('#main').height(640);
        d3.select('svg').attr('height', 640);

    }

    //drawLegend(svg);
    //drawWaterMark(svg);

    container = svg.append("g");
    linkContainer = container.append("g");



    zoom = d3.behavior.zoom()
        .scaleExtent([0.4, 2])
        .on("zoom", zoomed);
    svg.call(zoom);

    initLocation();

    function zoomed() {

        container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    function initLocation() {
        zoom.translate([svg.attr('width') / 2, svg.attr('height') / 2]);
        zoom.scale(0.6);
        container.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")");
    }

    nodes = tree.nodes(rootData);
    links = tree.links(nodes);
    nodes.forEach(function(d) {
        if (d.depth > 1) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            }
        }
    });

    root.x0 = 0;
    root.y0 = 0;
    drawTree(root);
}

function drawTree(data) {
    var diagonal = d3.svg.diagonal.radial()
        .projection(function(d) {
            return [d.y, d.x / 180 * Math.PI];
        });


    nodes = tree.nodes(rootData);
    links = tree.links(nodes);



    var pathLength = 150;
    if (nodes.length > 100) {
        pathLength = 200;
    }
    nodes.forEach(function(d) {
        if (d.depth > 2) {
            d.y = d.depth * (d.depth / 2) * 150;
        } else {
            d.y = d.depth * pathLength;
        }
    });



    var linkUpdate = linkContainer.selectAll(".link")
        .data(links, function(d) {
            return d.target.id;
        });
    var linkEnter = linkUpdate.enter();
    var linkExit = linkUpdate.exit();

    linkEnter.append("path")
        .attr("class", "link")
        .attr("d", function(d) {
            var o = {
                x: data.x0,
                y: data.y0
            };
            return diagonal({
                source: o,
                target: o
            });
        })
        .transition()
        .duration(500)
        .attr("d", diagonal);

    linkUpdate.attr("stroke", function(d) {
            if (d.source.Category == 2 || d.target.Category == 2) {
                return "#49ceb0";
            }

            if (d.source.Category == 3 || d.target.Category == 3) {
                return "#7985f1";
            }

            if (d.source.Category == 4 || d.target.Category == 4) {
                return "#65d289";
            }

            if (d.source.Category == 5 || d.target.Category == 5) {
                return "#bd73e7";
            }

            if (d.source.Category == 6 || d.target.Category == 6) {
                return "#ee7698";
            }

            if (d.source.Category == 7 || d.target.Category == 7) {
                return "#f59c28";
            }

            if (d.source.Category == 8 || d.target.Category == 8) {
                return "#79a3f1";
            }

            if (d.source.Category == 9 || d.target.Category == 9) {
                return "#3dc9f7";
            }

            return "#f35151";
        })
        .transition()
        .duration(500)
        .attr("d", diagonal)
        .attr("style", "fill: none; stroke-opacity: 1; stroke: #9ecae1; stroke-width: 1px;");


    linkExit.transition()
        .duration(500)
        .attr("d", function(d) {
            var o = {
                x: data.x,
                y: data.y
            };
            return diagonal({
                source: o,
                target: o
            });
        })
        .remove();

    var nodeUpdate = container.selectAll(".node")
        .data(nodes, function(d) {
            return d.id;
        });
    var nodeEnter = nodeUpdate.enter();
    var nodeExit = nodeUpdate.exit();

    var enterNodes = nodeEnter.append("g")
        .attr("class", function(d) {
            return "node";
        })
        .attr("transform", function(d) {
            return "translate(" + project(data.x0, data.y0) + ")";
        });
    enterNodes.append("circle")
        .attr("r", 0)
        .attr("fill", function(d) {
            if (d.Category == 1) {
                return "#3ea6ff";
            }

            if (d.Category == 2) {
                return "#49ceb0";
            }

            if (d.Category == 3) {
                return "#7985f1";
            }

            if (d.Category == 4) {
                return "#65d289";
            }

            if (d.Category == 5) {
                return "#bd73e7";
            }

            if (d.Category == 6) {
                return "#ee7698";
            }

            if (d.Category == 7) {
                return "#f59c28";
            }

            if (d.Category == 8) {
                return "#79a3f1";
            }

            if (d.Category == 9) {
                return "#3dc9f7";
            }

            return "#3ea6ff";
        })
        .attr("stroke", function(d) {

            if (d.depth == 0) {
                return "#3ea6ff";
            }

            if (d.depth == 1) {
                if (d.Category == 1) {
                    return "#3ea6ff";
                }

                if (d.Category == 2) {
                    return "#49ceb0";
                }

                if (d.Category == 3) {
                    return "#7985f1";
                }

                if (d.Category == 4) {
                    return "#65d289";
                }

                if (d.Category == 5) {
                    return "#bd73e7";
                }

                if (d.Category == 6) {
                    return "#ee7698";
                }

                if (d.Category == 7) {
                    return "#f59c28";
                }

                if (d.Category == 8) {
                    return "#79a3f1";
                }

                if (d.Category == 9) {
                    return "#3dc9f7";
                }
            }

            return null;
        })
        .attr("stroke-opacity", 0.5)
        .attr("stroke-width", function(d) {
            if (d.depth == 0) {
                return 10;
            }

            if (d.depth == 1) {
                return 6;
            }

            return 0;
        })
        .on("click", function(d) {
            if (d.depth > 0) {
                toggle(d);
                drawTree(d);
            }
        });

    enterNodes.append("path")
        .attr("d", function(d) {
            if (d.depth > 0 && d._children) {
                return "M-6 -1 H-1 V-6 H1 V-1 H6 V1 H1 V6 H-1 V1 H-6 Z"
            } else if (d.depth > 0 && d.children) {
                return "M-6 -1 H6 V1 H-6 Z"
            }
        })
        .attr("fill", "#ffffff")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", "0.2")
        .on("click", function(d) {
            if (d.depth > 0) {
                toggle(d);
                drawTree(d);
            }
        });
    enterNodes.append("text")
        .attr("dy", function(d) {
            if (d.depth == 0) {
                return "-1.5em";
            }
            return "0.31em";
        })
        .attr("x", function(d) {
            if (d.depth == 0) {
                return d.name.length * 8
            }
            return d.x < 180 ? 15 : -15;
        })
        .text(function(d) {
            return d.name;
        })
        .style("text-anchor", function(d) {
            if (d.depth == 0) {
                return "end";
            }
            return d.x < 180 ? "start" : "end";
        })
        .style("fill-opacity", 0)
        .attr("transform", function(d) {
            if (d.depth > 0) {
                return "rotate(" + (d.x < 180 ? d.x - 90 : d.x + 90) + ")";
            } else {
                return "rotate(0)";
            }
        })
        .style("font-size", function(d) {
            if (d.depth == 0) {
                return "16px";
            }
            return "14px";
        })
        .attr("fill", function(d) {
            if (d.depth == 0) {
                return "#2c91e8";
            }
            if (d.depth == 1) {
                if (d.Category == 2) {
                    return "#2db092";
                }

                if (d.Category == 3) {
                    return "#3d4cd4";
                }
            }
            return "#333";
        })
        .on("click", function(d) {
            if (d.KeyNo && d.depth > 0) {
                if (d.KeyNo.indexOf("_") < 0) {
                    showDetail(d.KeyNo);
                }
            }
        });

    var updateNodes = nodeUpdate.transition()
        .duration(500)
        .attr("transform", function(d) {
            return "translate(" + project(d.x, d.y) + ")";
        });
    updateNodes.select("text")
        .style("fill-opacity", 1)
        .attr("transform", function(d) {
            if (d.depth > 0) {
                return "rotate(" + (d.x < 180 ? d.x - 90 : d.x + 90) + ")";
            } else {
                return "rotate(0)";
            }
        })
        .attr("x", function(d) {
            if (d.depth == 0) {
                return d.name.length * 8
            }
            return d.x < 180 ? 15 : -15;
        })
        .attr("fill", function(d) {
            if (d.depth == 0) {
                return "#2c91e8";
            }
            if (d.depth == 1) {
                if (d.Category == 2) {
                    return "#2db092";
                }

                if (d.Category == 3) {
                    return "#3d4cd4";
                }
            }
            return "#333";
        })
        .style("text-anchor", function(d) {
            if (d.depth == 0) {
                return "end";
            }
            return d.x < 180 ? "start" : "end";
        });
    updateNodes.select("circle")
        .attr("r", function(d) {
            if (d.depth == 0) {
                return 12;
            }

            if (d.depth == 1) {
                return 10;
            }

            return 9;
        });
    updateNodes.select("path")
        .attr("d", function(d) {
            if (d.depth > 0 && d._children) {
                return "M-6 -1 H-1 V-6 H1 V-1 H6 V1 H1 V6 H-1 V1 H-6 Z"
            } else if (d.depth > 0 && d.children) {
                return "M-6 -1 H6 V1 H-6 Z"
            }
        });

    var exitNodes = nodeExit.transition()
        .duration(500)
        .attr("transform", function(d) {
            return "translate(" + project(data.x, data.y) + ")";
        })
        .remove();
    exitNodes.select("circle")
        .attr("r", 0);

    exitNodes.select("text")
        .style("fill-opacity", 0);

    nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });

}

function toggle(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;
    }
}

function project(x, y) {
    var angle = (x - 90) / 180 * Math.PI,
        radius = y;
    return [radius * Math.cos(angle), radius * Math.sin(angle)];
}

function drawWaterMark(svg) {
    var declare_text = "企业图谱由flyku生成。企业图谱由flyku生成。企业图谱由flyku生成";
    var text_width = $(window).width() - 20;
    var row = Math.ceil(declare_text.length / (Math.floor(text_width / 12)));
    var declare = svg.append("g")
        .attr("transform", "translate(" + ($(window).width() - declare_text.length * 12) / 2 + "," + (svg.attr('height') - 20) + ")");
    for (var i = 0; i < row; i++) {
        declare.append("text")
            .text(function() {
                return declare_text.substr(i * Math.floor(text_width / 12), Math.floor(text_width / 12));
            })
            .attr("fill", "#bbbbbb")
            .attr("font-size", "12px")
            .attr("y", function() {
                return i * 15;
            });
    }
}


function drawLegend(svg) {
    var legendGudong = svg.append('g')
        .attr("transform", "translate(" + ($(window).width() - 275) + ",80)");
    legendGudong.append('rect')
        .attr("width", "14")
        .attr("height", "14")
        .attr("rx", "3")
        .attr("ry", "3")
        .attr("y", "6")
        .attr('fill', "#4aceb1")
        .attr("z-index", "10");
    legendGudong.append('text')
        .attr("x", '20')
        .attr("y", "18")
        .text("对外投资")
        .attr("font-size", "16px");

    var legendTouzi = svg.append("g")
        .attr("transform", "translate(" + ($(window).width() - 275) + ",100)");
    legendTouzi.append('rect')
        .attr("width", "14")
        .attr("height", "14")
        .attr("rx", "3")
        .attr("ry", "3")
        .attr("y", "6")
        .attr('fill', "#7985f3");
    legendTouzi.append('text')
        .attr("x", "20")
        .attr("y", "18")
        .text("股东")
        .attr("font-size", "16px");
}



function traverseTree(node) {
    if (node._children) {
        node.children = node._children;
        node._children = null;
    }

    if (node.children) {
        for (var i = 0; i < node.children.length; i++) {
            traverseTree(node.children[i]);
        }
    }
}

function traverseTreeId(node) {
    var id = 1;
    trId(node);

    function trId(node) {
        if (!node.id) {
            node.id = id;
            id++;
        }
        if (node.children) {
            for (var i = 0; i < node.children.length; i++) {
                trId(node.children[i]);
            }
        }
    }
}

function traverseLevel(node, level, type) {
    // type=2投资, =3股东
    if (node.depth <= level) {
        if (node.Category == type) {
            if (node._children) {
                node.children = node._children;
                node._children = null;
            }
        }
    } else {
        if (node.Category == type) {
            if (node.children) {
                node._children = node.children;
                node.children = null;
            }
        }
    }

    if (node.children) {
        for (var i = 0; i < node.children.length; i++) {
            traverseLevel(node.children[i], level, type);
        }
    }

    if (node._children) {
        for (var i = 0; i < node._children.length; i++) {
            traverseLevel(node._children[i], level, type);
        }
    }
}


// 获取url中的参数
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURIComponent(r[2]);
    return null;
}

function download(canvas, type) {
    //设置保存图片的类型
    var imgdata = canvas.toDataURL(type);
    //将mime-type改为image/octet-stream,强制让浏览器下载
    var fixtype = function(type) {
        type = type.toLocaleLowerCase().replace(/jpg/i, 'jpeg');
        var r = type.match(/png|jpeg|bmp|gif/)[0];
        return 'image/' + r;
    }
    imgdata = imgdata.replace(fixtype(type), 'image/octet-stream')
        //将图片保存到本地
    var saveFile = function(data, filename) {
        var link = document.createElement('a');
        link.href = data;
        link.download = filename;
        var event = document.createEvent('MouseEvents');
        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        link.dispatchEvent(event);
    }
    var filename = new Date().toLocaleDateString() + '.' + type;
    saveFile(imgdata, filename);
}