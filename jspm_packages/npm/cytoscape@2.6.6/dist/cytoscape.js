/* */ 
"format cjs";
(function(process) {
  (function(f) {
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = f();
    } else if (typeof define === "function" && define.amd) {
      define([], f);
    } else {
      var g;
      if (typeof window !== "undefined") {
        g = window;
      } else if (typeof global !== "undefined") {
        g = global;
      } else if (typeof self !== "undefined") {
        g = self;
      } else {
        g = this;
      }
      g.cytoscape = f();
    }
  })(function() {
    var define,
        module,
        exports;
    return (function e(t, n, r) {
      function s(o, u) {
        if (!n[o]) {
          if (!t[o]) {
            var a = typeof require == "function" && require;
            if (!u && a)
              return a(o, !0);
            if (i)
              return i(o, !0);
            var f = new Error("Cannot find module '" + o + "'");
            throw f.code = "MODULE_NOT_FOUND", f;
          }
          var l = n[o] = {exports: {}};
          t[o][0].call(l.exports, function(e) {
            var n = t[o][1][e];
            return s(n ? n : e);
          }, l, l.exports, e, t, n, r);
        }
        return n[o].exports;
      }
      var i = typeof require == "function" && require;
      for (var o = 0; o < r.length; o++)
        s(r[o]);
      return s;
    })({
      1: [function(_dereq_, module, exports) {
        'use strict';
        var util = _dereq_('./util');
        var is = _dereq_('./is');
        var Promise = _dereq_('./promise');
        var Animation = function(target, opts, opts2) {
          if (!(this instanceof Animation)) {
            return new Animation(target, opts, opts2);
          }
          var _p = this._private = util.extend({duration: 1000}, opts, opts2);
          _p.target = target;
          _p.style = _p.style || _p.css;
          _p.started = false;
          _p.playing = false;
          _p.hooked = false;
          _p.applying = false;
          _p.progress = 0;
          _p.completes = [];
          _p.frames = [];
          if (_p.complete && is.fn(_p.complete)) {
            _p.completes.push(_p.complete);
          }
          this.length = 1;
          this[0] = this;
        };
        var anifn = Animation.prototype;
        util.extend(anifn, {
          instanceString: function() {
            return 'animation';
          },
          hook: function() {
            var _p = this._private;
            if (!_p.hooked) {
              var q;
              var tAni = _p.target._private.animation;
              if (_p.queue) {
                q = tAni.queue;
              } else {
                q = tAni.current;
              }
              q.push(this);
              if (is.elementOrCollection(_p.target)) {
                _p.target.cy().addToAnimationPool(_p.target);
              }
              _p.hooked = true;
            }
            return this;
          },
          play: function() {
            var _p = this._private;
            if (_p.progress === 1) {
              _p.progress = 0;
            }
            _p.playing = true;
            _p.started = false;
            _p.stopped = false;
            this.hook();
            return this;
          },
          playing: function() {
            return this._private.playing;
          },
          apply: function() {
            var _p = this._private;
            _p.applying = true;
            _p.started = false;
            _p.stopped = false;
            this.hook();
            return this;
          },
          applying: function() {
            return this._private.applying;
          },
          pause: function() {
            var _p = this._private;
            _p.playing = false;
            _p.started = false;
            return this;
          },
          stop: function() {
            var _p = this._private;
            _p.playing = false;
            _p.started = false;
            _p.stopped = true;
            return this;
          },
          rewind: function() {
            return this.progress(0);
          },
          fastforward: function() {
            return this.progress(1);
          },
          time: function(t) {
            var _p = this._private;
            if (t === undefined) {
              return _p.progress * _p.duration;
            } else {
              return this.progress(t / _p.duration);
            }
          },
          progress: function(p) {
            var _p = this._private;
            var wasPlaying = _p.playing;
            if (p === undefined) {
              return _p.progress;
            } else {
              if (wasPlaying) {
                this.pause();
              }
              _p.progress = p;
              _p.started = false;
              if (wasPlaying) {
                this.play();
              }
            }
            return this;
          },
          completed: function() {
            return this._private.progress === 1;
          },
          reverse: function() {
            var _p = this._private;
            var wasPlaying = _p.playing;
            if (wasPlaying) {
              this.pause();
            }
            _p.progress = 1 - _p.progress;
            _p.started = false;
            var swap = function(a, b) {
              var _pa = _p[a];
              _p[a] = _p[b];
              _p[b] = _pa;
            };
            swap('zoom', 'startZoom');
            swap('pan', 'startPan');
            swap('position', 'startPosition');
            for (var i = 0; i < _p.style.length; i++) {
              var prop = _p.style[i];
              var name = prop.name;
              var startStyleProp = _p.startStyle[name];
              _p.startStyle[name] = _p.startStyle[util.dash2camel(name)] = prop;
              _p.style[i] = startStyleProp;
            }
            if (wasPlaying) {
              this.play();
            }
            return this;
          },
          promise: function(type) {
            var _p = this._private;
            var arr;
            switch (type) {
              case 'frame':
                arr = _p.frames;
                break;
              default:
              case 'complete':
              case 'completed':
                arr = _p.completes;
            }
            return new Promise(function(resolve, reject) {
              arr.push(function() {
                resolve();
              });
            });
          }
        });
        anifn.complete = anifn.completed;
        module.exports = Animation;
      }, {
        "./is": 77,
        "./promise": 80,
        "./util": 94
      }],
      2: [function(_dereq_, module, exports) {
        'use strict';
        var is = _dereq_('../../is');
        var elesfn = ({aStar: function(options) {
            var eles = this;
            options = options || {};
            var reconstructPath = function(start, end, cameFromMap, pathAcum) {
              if (start == end) {
                pathAcum.push(cy.getElementById(end));
                return pathAcum;
              }
              if (end in cameFromMap) {
                var previous = cameFromMap[end];
                var previousEdge = cameFromEdge[end];
                pathAcum.push(cy.getElementById(end));
                pathAcum.push(cy.getElementById(previousEdge));
                return reconstructPath(start, previous, cameFromMap, pathAcum);
              }
              return undefined;
            };
            var findMin = function(openSet, fScore) {
              if (openSet.length === 0) {
                return undefined;
              }
              var minPos = 0;
              var tempScore = fScore[openSet[0]];
              for (var i = 1; i < openSet.length; i++) {
                var s = fScore[openSet[i]];
                if (s < tempScore) {
                  tempScore = s;
                  minPos = i;
                }
              }
              return minPos;
            };
            var cy = this._private.cy;
            if (options != null && options.root != null) {
              var source = is.string(options.root) ? this.filter(options.root)[0] : options.root[0];
            } else {
              return undefined;
            }
            if (options.goal != null) {
              var target = is.string(options.goal) ? this.filter(options.goal)[0] : options.goal[0];
            } else {
              return undefined;
            }
            if (options.heuristic != null && is.fn(options.heuristic)) {
              var heuristic = options.heuristic;
            } else {
              var heuristic = function() {
                return 0;
              };
            }
            if (options.weight != null && is.fn(options.weight)) {
              var weightFn = options.weight;
            } else {
              var weightFn = function(e) {
                return 1;
              };
            }
            if (options.directed != null) {
              var directed = options.directed;
            } else {
              var directed = false;
            }
            var closedSet = [];
            var openSet = [source.id()];
            var cameFrom = {};
            var cameFromEdge = {};
            var gScore = {};
            var fScore = {};
            gScore[source.id()] = 0;
            fScore[source.id()] = heuristic(source);
            var edges = this.edges().stdFilter(function(e) {
              return !e.isLoop();
            });
            var nodes = this.nodes();
            var steps = 0;
            while (openSet.length > 0) {
              var minPos = findMin(openSet, fScore);
              var cMin = cy.getElementById(openSet[minPos]);
              steps++;
              if (cMin.id() == target.id()) {
                var rPath = reconstructPath(source.id(), target.id(), cameFrom, []);
                rPath.reverse();
                return {
                  found: true,
                  distance: gScore[cMin.id()],
                  path: eles.spawn(rPath),
                  steps: steps
                };
              }
              closedSet.push(cMin.id());
              openSet.splice(minPos, 1);
              var vwEdges = cMin.connectedEdges();
              if (directed) {
                vwEdges = vwEdges.stdFilter(function(ele) {
                  return ele.data('source') === cMin.id();
                });
              }
              vwEdges = vwEdges.intersect(edges);
              for (var i = 0; i < vwEdges.length; i++) {
                var e = vwEdges[i];
                var w = e.connectedNodes().stdFilter(function(n) {
                  return n.id() !== cMin.id();
                }).intersect(nodes);
                if (closedSet.indexOf(w.id()) != -1) {
                  continue;
                }
                var tempScore = gScore[cMin.id()] + weightFn.apply(e, [e]);
                if (openSet.indexOf(w.id()) == -1) {
                  gScore[w.id()] = tempScore;
                  fScore[w.id()] = tempScore + heuristic(w);
                  openSet.push(w.id());
                  cameFrom[w.id()] = cMin.id();
                  cameFromEdge[w.id()] = e.id();
                  continue;
                }
                if (tempScore < gScore[w.id()]) {
                  gScore[w.id()] = tempScore;
                  fScore[w.id()] = tempScore + heuristic(w);
                  cameFrom[w.id()] = cMin.id();
                }
              }
            }
            return {
              found: false,
              distance: undefined,
              path: undefined,
              steps: steps
            };
          }});
        module.exports = elesfn;
      }, {"../../is": 77}],
      3: [function(_dereq_, module, exports) {
        'use strict';
        var is = _dereq_('../../is');
        var util = _dereq_('../../util');
        var elesfn = ({bellmanFord: function(options) {
            var eles = this;
            options = options || {};
            if (options.weight != null && is.fn(options.weight)) {
              var weightFn = options.weight;
            } else {
              var weightFn = function(e) {
                return 1;
              };
            }
            if (options.directed != null) {
              var directed = options.directed;
            } else {
              var directed = false;
            }
            if (options.root != null) {
              if (is.string(options.root)) {
                var source = this.filter(options.root)[0];
              } else {
                var source = options.root[0];
              }
            } else {
              return undefined;
            }
            var cy = this._private.cy;
            var edges = this.edges().stdFilter(function(e) {
              return !e.isLoop();
            });
            var nodes = this.nodes();
            var numNodes = nodes.length;
            var id2position = {};
            for (var i = 0; i < numNodes; i++) {
              id2position[nodes[i].id()] = i;
            }
            var cost = [];
            var predecessor = [];
            var predEdge = [];
            for (var i = 0; i < numNodes; i++) {
              if (nodes[i].id() === source.id()) {
                cost[i] = 0;
              } else {
                cost[i] = Infinity;
              }
              predecessor[i] = undefined;
            }
            var flag = false;
            for (var i = 1; i < numNodes; i++) {
              flag = false;
              for (var e = 0; e < edges.length; e++) {
                var sourceIndex = id2position[edges[e].source().id()];
                var targetIndex = id2position[edges[e].target().id()];
                var weight = weightFn.apply(edges[e], [edges[e]]);
                var temp = cost[sourceIndex] + weight;
                if (temp < cost[targetIndex]) {
                  cost[targetIndex] = temp;
                  predecessor[targetIndex] = sourceIndex;
                  predEdge[targetIndex] = edges[e];
                  flag = true;
                }
                if (!directed) {
                  var temp = cost[targetIndex] + weight;
                  if (temp < cost[sourceIndex]) {
                    cost[sourceIndex] = temp;
                    predecessor[sourceIndex] = targetIndex;
                    predEdge[sourceIndex] = edges[e];
                    flag = true;
                  }
                }
              }
              if (!flag) {
                break;
              }
            }
            if (flag) {
              for (var e = 0; e < edges.length; e++) {
                var sourceIndex = id2position[edges[e].source().id()];
                var targetIndex = id2position[edges[e].target().id()];
                var weight = weightFn.apply(edges[e], [edges[e]]);
                if (cost[sourceIndex] + weight < cost[targetIndex]) {
                  util.error("Graph contains a negative weight cycle for Bellman-Ford");
                  return {
                    pathTo: undefined,
                    distanceTo: undefined,
                    hasNegativeWeightCycle: true
                  };
                }
              }
            }
            var position2id = [];
            for (var i = 0; i < numNodes; i++) {
              position2id.push(nodes[i].id());
            }
            var res = {
              distanceTo: function(to) {
                if (is.string(to)) {
                  var toId = (cy.filter(to)[0]).id();
                } else {
                  var toId = to.id();
                }
                return cost[id2position[toId]];
              },
              pathTo: function(to) {
                var reconstructPathAux = function(predecessor, fromPos, toPos, position2id, acumPath, predEdge) {
                  for (; ; ) {
                    acumPath.push(cy.getElementById(position2id[toPos]));
                    acumPath.push(predEdge[toPos]);
                    if (fromPos === toPos) {
                      return acumPath;
                    }
                    var predPos = predecessor[toPos];
                    if (typeof predPos === "undefined") {
                      return undefined;
                    }
                    toPos = predPos;
                  }
                };
                if (is.string(to)) {
                  var toId = (cy.filter(to)[0]).id();
                } else {
                  var toId = to.id();
                }
                var path = [];
                var res = reconstructPathAux(predecessor, id2position[source.id()], id2position[toId], position2id, path, predEdge);
                if (res != null) {
                  res.reverse();
                }
                return eles.spawn(res);
              },
              hasNegativeWeightCycle: false
            };
            return res;
          }});
        module.exports = elesfn;
      }, {
        "../../is": 77,
        "../../util": 94
      }],
      4: [function(_dereq_, module, exports) {
        'use strict';
        var is = _dereq_('../../is');
        var elesfn = ({betweennessCentrality: function(options) {
            options = options || {};
            if (options.weight != null && is.fn(options.weight)) {
              var weightFn = options.weight;
              var weighted = true;
            } else {
              var weighted = false;
            }
            if (options.directed != null && is.bool(options.directed)) {
              var directed = options.directed;
            } else {
              var directed = false;
            }
            var priorityInsert = function(queue, ele) {
              queue.unshift(ele);
              for (var i = 0; d[queue[i]] < d[queue[i + 1]] && i < queue.length - 1; i++) {
                var tmp = queue[i];
                queue[i] = queue[i + 1];
                queue[i + 1] = tmp;
              }
            };
            var cy = this._private.cy;
            var V = this.nodes();
            var A = {};
            var C = {};
            for (var i = 0; i < V.length; i++) {
              if (directed) {
                A[V[i].id()] = V[i].outgoers("node");
              } else {
                A[V[i].id()] = V[i].openNeighborhood("node");
              }
            }
            for (var i = 0; i < V.length; i++) {
              C[V[i].id()] = 0;
            }
            for (var s = 0; s < V.length; s++) {
              var S = [];
              var P = {};
              var g = {};
              var d = {};
              var Q = [];
              for (var i = 0; i < V.length; i++) {
                P[V[i].id()] = [];
                g[V[i].id()] = 0;
                d[V[i].id()] = Number.POSITIVE_INFINITY;
              }
              g[V[s].id()] = 1;
              d[V[s].id()] = 0;
              Q.unshift(V[s].id());
              while (Q.length > 0) {
                var v = Q.pop();
                S.push(v);
                if (weighted) {
                  A[v].forEach(function(w) {
                    if (cy.$('#' + v).edgesTo(w).length > 0) {
                      var edge = cy.$('#' + v).edgesTo(w)[0];
                    } else {
                      var edge = w.edgesTo('#' + v)[0];
                    }
                    var edgeWeight = weightFn.apply(edge, [edge]);
                    if (d[w.id()] > d[v] + edgeWeight) {
                      d[w.id()] = d[v] + edgeWeight;
                      if (Q.indexOf(w.id()) < 0) {
                        priorityInsert(Q, w.id());
                      } else {
                        Q.splice(Q.indexOf(w.id()), 1);
                        priorityInsert(Q, w.id());
                      }
                      g[w.id()] = 0;
                      P[w.id()] = [];
                    }
                    if (d[w.id()] == d[v] + edgeWeight) {
                      g[w.id()] = g[w.id()] + g[v];
                      P[w.id()].push(v);
                    }
                  });
                } else {
                  A[v].forEach(function(w) {
                    if (d[w.id()] == Number.POSITIVE_INFINITY) {
                      Q.unshift(w.id());
                      d[w.id()] = d[v] + 1;
                    }
                    if (d[w.id()] == d[v] + 1) {
                      g[w.id()] = g[w.id()] + g[v];
                      P[w.id()].push(v);
                    }
                  });
                }
              }
              var e = {};
              for (var i = 0; i < V.length; i++) {
                e[V[i].id()] = 0;
              }
              while (S.length > 0) {
                var w = S.pop();
                P[w].forEach(function(v) {
                  e[v] = e[v] + (g[v] / g[w]) * (1 + e[w]);
                  if (w != V[s].id())
                    C[w] = C[w] + e[w];
                });
              }
            }
            var max = 0;
            for (var key in C) {
              if (max < C[key])
                max = C[key];
            }
            var ret = {
              betweenness: function(node) {
                if (is.string(node)) {
                  var node = (cy.filter(node)[0]).id();
                } else {
                  var node = node.id();
                }
                return C[node];
              },
              betweennessNormalized: function(node) {
                if (is.string(node)) {
                  var node = (cy.filter(node)[0]).id();
                } else {
                  var node = node.id();
                }
                return C[node] / max;
              }
            };
            ret.betweennessNormalised = ret.betweennessNormalized;
            return ret;
          }});
        elesfn.bc = elesfn.betweennessCentrality;
        module.exports = elesfn;
      }, {"../../is": 77}],
      5: [function(_dereq_, module, exports) {
        'use strict';
        var is = _dereq_('../../is');
        var Heap = _dereq_('../../heap');
        var defineSearch = function(params) {
          params = {
            bfs: params.bfs || !params.dfs,
            dfs: params.dfs || !params.bfs
          };
          return function searchFn(roots, fn, directed) {
            var options;
            var std;
            var thisArg;
            if (is.plainObject(roots) && !is.elementOrCollection(roots)) {
              options = roots;
              roots = options.roots || options.root;
              fn = options.visit;
              directed = options.directed;
              std = options.std;
              thisArg = options.thisArg;
            }
            directed = arguments.length === 2 && !is.fn(fn) ? fn : directed;
            fn = is.fn(fn) ? fn : function() {};
            var cy = this._private.cy;
            var v = roots = is.string(roots) ? this.filter(roots) : roots;
            var Q = [];
            var connectedNodes = [];
            var connectedBy = {};
            var id2depth = {};
            var V = {};
            var j = 0;
            var found;
            var nodes = this.nodes();
            var edges = this.edges();
            for (var i = 0; i < v.length; i++) {
              if (v[i].isNode()) {
                Q.unshift(v[i]);
                if (params.bfs) {
                  V[v[i].id()] = true;
                  connectedNodes.push(v[i]);
                }
                id2depth[v[i].id()] = 0;
              }
            }
            while (Q.length !== 0) {
              var v = params.bfs ? Q.shift() : Q.pop();
              if (params.dfs) {
                if (V[v.id()]) {
                  continue;
                }
                V[v.id()] = true;
                connectedNodes.push(v);
              }
              var depth = id2depth[v.id()];
              var prevEdge = connectedBy[v.id()];
              var prevNode = prevEdge == null ? undefined : prevEdge.connectedNodes().not(v)[0];
              var ret;
              if (std) {
                ret = fn.call(thisArg, v, prevEdge, prevNode, j++, depth);
              } else {
                ret = fn.call(v, j++, depth, v, prevEdge, prevNode);
              }
              if (ret === true) {
                found = v;
                break;
              }
              if (ret === false) {
                break;
              }
              var vwEdges = v.connectedEdges(directed ? function() {
                return this.data('source') === v.id();
              } : undefined).intersect(edges);
              for (var i = 0; i < vwEdges.length; i++) {
                var e = vwEdges[i];
                var w = e.connectedNodes(function() {
                  return this.id() !== v.id();
                }).intersect(nodes);
                if (w.length !== 0 && !V[w.id()]) {
                  w = w[0];
                  Q.push(w);
                  if (params.bfs) {
                    V[w.id()] = true;
                    connectedNodes.push(w);
                  }
                  connectedBy[w.id()] = e;
                  id2depth[w.id()] = id2depth[v.id()] + 1;
                }
              }
            }
            var connectedEles = [];
            for (var i = 0; i < connectedNodes.length; i++) {
              var node = connectedNodes[i];
              var edge = connectedBy[node.id()];
              if (edge) {
                connectedEles.push(edge);
              }
              connectedEles.push(node);
            }
            return {
              path: cy.collection(connectedEles, {unique: true}),
              found: cy.collection(found)
            };
          };
        };
        var elesfn = ({
          breadthFirstSearch: defineSearch({bfs: true}),
          depthFirstSearch: defineSearch({dfs: true}),
          kruskal: function(weightFn) {
            var cy = this.cy();
            weightFn = is.fn(weightFn) ? weightFn : function() {
              return 1;
            };
            function findSet(ele) {
              for (var i = 0; i < forest.length; i++) {
                var eles = forest[i];
                if (eles.anySame(ele)) {
                  return {
                    eles: eles,
                    index: i
                  };
                }
              }
            }
            var A = cy.collection(cy, []);
            var forest = [];
            var nodes = this.nodes();
            for (var i = 0; i < nodes.length; i++) {
              forest.push(nodes[i].collection());
            }
            var edges = this.edges();
            var S = edges.toArray().sort(function(a, b) {
              var weightA = weightFn.call(a, a);
              var weightB = weightFn.call(b, b);
              return weightA - weightB;
            });
            for (var i = 0; i < S.length; i++) {
              var edge = S[i];
              var u = edge.source()[0];
              var v = edge.target()[0];
              var setU = findSet(u);
              var setV = findSet(v);
              if (setU.index !== setV.index) {
                A = A.add(edge);
                forest[setU.index] = setU.eles.add(setV.eles);
                forest.splice(setV.index, 1);
              }
            }
            return nodes.add(A);
          },
          dijkstra: function(root, weightFn, directed) {
            var options;
            if (is.plainObject(root) && !is.elementOrCollection(root)) {
              options = root;
              root = options.root;
              weightFn = options.weight;
              directed = options.directed;
            }
            var cy = this._private.cy;
            weightFn = is.fn(weightFn) ? weightFn : function() {
              return 1;
            };
            var source = is.string(root) ? this.filter(root)[0] : root[0];
            var dist = {};
            var prev = {};
            var knownDist = {};
            var edges = this.edges().filter(function() {
              return !this.isLoop();
            });
            var nodes = this.nodes();
            var getDist = function(node) {
              return dist[node.id()];
            };
            var setDist = function(node, d) {
              dist[node.id()] = d;
              Q.updateItem(node);
            };
            var Q = new Heap(function(a, b) {
              return getDist(a) - getDist(b);
            });
            for (var i = 0; i < nodes.length; i++) {
              var node = nodes[i];
              dist[node.id()] = node.same(source) ? 0 : Infinity;
              Q.push(node);
            }
            var distBetween = function(u, v) {
              var uvs = (directed ? u.edgesTo(v) : u.edgesWith(v)).intersect(edges);
              var smallestDistance = Infinity;
              var smallestEdge;
              for (var i = 0; i < uvs.length; i++) {
                var edge = uvs[i];
                var weight = weightFn.apply(edge, [edge]);
                if (weight < smallestDistance || !smallestEdge) {
                  smallestDistance = weight;
                  smallestEdge = edge;
                }
              }
              return {
                edge: smallestEdge,
                dist: smallestDistance
              };
            };
            while (Q.size() > 0) {
              var u = Q.pop();
              var smalletsDist = getDist(u);
              var uid = u.id();
              knownDist[uid] = smalletsDist;
              if (smalletsDist === Math.Infinite) {
                break;
              }
              var neighbors = u.neighborhood().intersect(nodes);
              for (var i = 0; i < neighbors.length; i++) {
                var v = neighbors[i];
                var vid = v.id();
                var vDist = distBetween(u, v);
                var alt = smalletsDist + vDist.dist;
                if (alt < getDist(v)) {
                  setDist(v, alt);
                  prev[vid] = {
                    node: u,
                    edge: vDist.edge
                  };
                }
              }
            }
            return {
              distanceTo: function(node) {
                var target = is.string(node) ? nodes.filter(node)[0] : node[0];
                return knownDist[target.id()];
              },
              pathTo: function(node) {
                var target = is.string(node) ? nodes.filter(node)[0] : node[0];
                var S = [];
                var u = target;
                if (target.length > 0) {
                  S.unshift(target);
                  while (prev[u.id()]) {
                    var p = prev[u.id()];
                    S.unshift(p.edge);
                    S.unshift(p.node);
                    u = p.node;
                  }
                }
                return cy.collection(S);
              }
            };
          }
        });
        elesfn.bfs = elesfn.breadthFirstSearch;
        elesfn.dfs = elesfn.depthFirstSearch;
        module.exports = elesfn;
      }, {
        "../../heap": 75,
        "../../is": 77
      }],
      6: [function(_dereq_, module, exports) {
        'use strict';
        var is = _dereq_('../../is');
        var elesfn = ({
          closenessCentralityNormalized: function(options) {
            options = options || {};
            var cy = this.cy();
            var harmonic = options.harmonic;
            if (harmonic === undefined) {
              harmonic = true;
            }
            var closenesses = {};
            var maxCloseness = 0;
            var nodes = this.nodes();
            var fw = this.floydWarshall({
              weight: options.weight,
              directed: options.directed
            });
            for (var i = 0; i < nodes.length; i++) {
              var currCloseness = 0;
              for (var j = 0; j < nodes.length; j++) {
                if (i != j) {
                  var d = fw.distance(nodes[i], nodes[j]);
                  if (harmonic) {
                    currCloseness += 1 / d;
                  } else {
                    currCloseness += d;
                  }
                }
              }
              if (!harmonic) {
                currCloseness = 1 / currCloseness;
              }
              if (maxCloseness < currCloseness) {
                maxCloseness = currCloseness;
              }
              closenesses[nodes[i].id()] = currCloseness;
            }
            return {closeness: function(node) {
                if (is.string(node)) {
                  var node = (cy.filter(node)[0]).id();
                } else {
                  var node = node.id();
                }
                return closenesses[node] / maxCloseness;
              }};
          },
          closenessCentrality: function(options) {
            options = options || {};
            if (options.root != null) {
              if (is.string(options.root)) {
                var root = this.filter(options.root)[0];
              } else {
                var root = options.root[0];
              }
            } else {
              return undefined;
            }
            if (options.weight != null && is.fn(options.weight)) {
              var weight = options.weight;
            } else {
              var weight = function() {
                return 1;
              };
            }
            if (options.directed != null && is.bool(options.directed)) {
              var directed = options.directed;
            } else {
              var directed = false;
            }
            var harmonic = options.harmonic;
            if (harmonic === undefined) {
              harmonic = true;
            }
            var dijkstra = this.dijkstra({
              root: root,
              weight: weight,
              directed: directed
            });
            var totalDistance = 0;
            var nodes = this.nodes();
            for (var i = 0; i < nodes.length; i++) {
              if (nodes[i].id() != root.id()) {
                var d = dijkstra.distanceTo(nodes[i]);
                if (harmonic) {
                  totalDistance += 1 / d;
                } else {
                  totalDistance += d;
                }
              }
            }
            return harmonic ? totalDistance : 1 / totalDistance;
          }
        });
        elesfn.cc = elesfn.closenessCentrality;
        elesfn.ccn = elesfn.closenessCentralityNormalised = elesfn.closenessCentralityNormalized;
        module.exports = elesfn;
      }, {"../../is": 77}],
      7: [function(_dereq_, module, exports) {
        'use strict';
        var is = _dereq_('../../is');
        var util = _dereq_('../../util');
        var elesfn = ({
          degreeCentralityNormalized: function(options) {
            options = options || {};
            var cy = this.cy();
            if (options.directed != null) {
              var directed = options.directed;
            } else {
              var directed = false;
            }
            var nodes = this.nodes();
            var numNodes = nodes.length;
            if (!directed) {
              var degrees = {};
              var maxDegree = 0;
              for (var i = 0; i < numNodes; i++) {
                var node = nodes[i];
                var currDegree = this.degreeCentrality(util.extend({}, options, {root: node}));
                if (maxDegree < currDegree.degree)
                  maxDegree = currDegree.degree;
                degrees[node.id()] = currDegree.degree;
              }
              return {degree: function(node) {
                  if (is.string(node)) {
                    var node = (cy.filter(node)[0]).id();
                  } else {
                    var node = node.id();
                  }
                  return degrees[node] / maxDegree;
                }};
            } else {
              var indegrees = {};
              var outdegrees = {};
              var maxIndegree = 0;
              var maxOutdegree = 0;
              for (var i = 0; i < numNodes; i++) {
                var node = nodes[i];
                var currDegree = this.degreeCentrality(util.extend({}, options, {root: node}));
                if (maxIndegree < currDegree.indegree)
                  maxIndegree = currDegree.indegree;
                if (maxOutdegree < currDegree.outdegree)
                  maxOutdegree = currDegree.outdegree;
                indegrees[node.id()] = currDegree.indegree;
                outdegrees[node.id()] = currDegree.outdegree;
              }
              return {
                indegree: function(node) {
                  if (is.string(node)) {
                    var node = (cy.filter(node)[0]).id();
                  } else {
                    var node = node.id();
                  }
                  return indegrees[node] / maxIndegree;
                },
                outdegree: function(node) {
                  if (is.string(node)) {
                    var node = (cy.filter(node)[0]).id();
                  } else {
                    var node = node.id();
                  }
                  return outdegrees[node] / maxOutdegree;
                }
              };
            }
          },
          degreeCentrality: function(options) {
            options = options || {};
            var callingEles = this;
            if (options != null && options.root != null) {
              var root = is.string(options.root) ? this.filter(options.root)[0] : options.root[0];
            } else {
              return undefined;
            }
            if (options.weight != null && is.fn(options.weight)) {
              var weightFn = options.weight;
            } else {
              var weightFn = function(e) {
                return 1;
              };
            }
            if (options.directed != null) {
              var directed = options.directed;
            } else {
              var directed = false;
            }
            if (options.alpha != null && is.number(options.alpha)) {
              var alpha = options.alpha;
            } else {
              alpha = 0;
            }
            if (!directed) {
              var connEdges = root.connectedEdges().intersection(callingEles);
              var k = connEdges.length;
              var s = 0;
              for (var i = 0; i < connEdges.length; i++) {
                var edge = connEdges[i];
                s += weightFn.apply(edge, [edge]);
              }
              return {degree: Math.pow(k, 1 - alpha) * Math.pow(s, alpha)};
            } else {
              var incoming = root.connectedEdges('edge[target = "' + root.id() + '"]').intersection(callingEles);
              var outgoing = root.connectedEdges('edge[source = "' + root.id() + '"]').intersection(callingEles);
              var k_in = incoming.length;
              var k_out = outgoing.length;
              var s_in = 0;
              var s_out = 0;
              for (var i = 0; i < incoming.length; i++) {
                var edge = incoming[i];
                s_in += weightFn.apply(edge, [edge]);
              }
              for (var i = 0; i < outgoing.length; i++) {
                var edge = outgoing[i];
                s_out += weightFn.apply(edge, [edge]);
              }
              return {
                indegree: Math.pow(k_in, 1 - alpha) * Math.pow(s_in, alpha),
                outdegree: Math.pow(k_out, 1 - alpha) * Math.pow(s_out, alpha)
              };
            }
          }
        });
        elesfn.dc = elesfn.degreeCentrality;
        elesfn.dcn = elesfn.degreeCentralityNormalised = elesfn.degreeCentralityNormalized;
        module.exports = elesfn;
      }, {
        "../../is": 77,
        "../../util": 94
      }],
      8: [function(_dereq_, module, exports) {
        'use strict';
        var is = _dereq_('../../is');
        var elesfn = ({floydWarshall: function(options) {
            options = options || {};
            var cy = this.cy();
            if (options.weight != null && is.fn(options.weight)) {
              var weightFn = options.weight;
            } else {
              var weightFn = function(e) {
                return 1;
              };
            }
            if (options.directed != null) {
              var directed = options.directed;
            } else {
              var directed = false;
            }
            var edges = this.edges().stdFilter(function(e) {
              return !e.isLoop();
            });
            var nodes = this.nodes();
            var numNodes = nodes.length;
            var id2position = {};
            for (var i = 0; i < numNodes; i++) {
              id2position[nodes[i].id()] = i;
            }
            var dist = [];
            for (var i = 0; i < numNodes; i++) {
              var newRow = new Array(numNodes);
              for (var j = 0; j < numNodes; j++) {
                if (i == j) {
                  newRow[j] = 0;
                } else {
                  newRow[j] = Infinity;
                }
              }
              dist.push(newRow);
            }
            var next = [];
            var edgeNext = [];
            var initMatrix = function(next) {
              for (var i = 0; i < numNodes; i++) {
                var newRow = new Array(numNodes);
                for (var j = 0; j < numNodes; j++) {
                  newRow[j] = undefined;
                }
                next.push(newRow);
              }
            };
            initMatrix(next);
            initMatrix(edgeNext);
            for (var i = 0; i < edges.length; i++) {
              var sourceIndex = id2position[edges[i].source().id()];
              var targetIndex = id2position[edges[i].target().id()];
              var weight = weightFn.apply(edges[i], [edges[i]]);
              if (dist[sourceIndex][targetIndex] > weight) {
                dist[sourceIndex][targetIndex] = weight;
                next[sourceIndex][targetIndex] = targetIndex;
                edgeNext[sourceIndex][targetIndex] = edges[i];
              }
            }
            if (!directed) {
              for (var i = 0; i < edges.length; i++) {
                var sourceIndex = id2position[edges[i].target().id()];
                var targetIndex = id2position[edges[i].source().id()];
                var weight = weightFn.apply(edges[i], [edges[i]]);
                if (dist[sourceIndex][targetIndex] > weight) {
                  dist[sourceIndex][targetIndex] = weight;
                  next[sourceIndex][targetIndex] = targetIndex;
                  edgeNext[sourceIndex][targetIndex] = edges[i];
                }
              }
            }
            for (var k = 0; k < numNodes; k++) {
              for (var i = 0; i < numNodes; i++) {
                for (var j = 0; j < numNodes; j++) {
                  if (dist[i][k] + dist[k][j] < dist[i][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j];
                    next[i][j] = next[i][k];
                  }
                }
              }
            }
            var position2id = [];
            for (var i = 0; i < numNodes; i++) {
              position2id.push(nodes[i].id());
            }
            var res = {
              distance: function(from, to) {
                if (is.string(from)) {
                  var fromId = (cy.filter(from)[0]).id();
                } else {
                  var fromId = from.id();
                }
                if (is.string(to)) {
                  var toId = (cy.filter(to)[0]).id();
                } else {
                  var toId = to.id();
                }
                return dist[id2position[fromId]][id2position[toId]];
              },
              path: function(from, to) {
                var reconstructPathAux = function(from, to, next, position2id, edgeNext) {
                  if (from === to) {
                    return cy.getElementById(position2id[from]);
                  }
                  if (next[from][to] === undefined) {
                    return undefined;
                  }
                  var path = [cy.getElementById(position2id[from])];
                  var prev = from;
                  while (from !== to) {
                    prev = from;
                    from = next[from][to];
                    var edge = edgeNext[prev][from];
                    path.push(edge);
                    path.push(cy.getElementById(position2id[from]));
                  }
                  return path;
                };
                if (is.string(from)) {
                  var fromId = (cy.filter(from)[0]).id();
                } else {
                  var fromId = from.id();
                }
                if (is.string(to)) {
                  var toId = (cy.filter(to)[0]).id();
                } else {
                  var toId = to.id();
                }
                var pathArr = reconstructPathAux(id2position[fromId], id2position[toId], next, position2id, edgeNext);
                return cy.collection(pathArr);
              }
            };
            return res;
          }});
        module.exports = elesfn;
      }, {"../../is": 77}],
      9: [function(_dereq_, module, exports) {
        'use strict';
        var util = _dereq_('../../util');
        var elesfn = {};
        [_dereq_('./bfs-dfs'), _dereq_('./a-star'), _dereq_('./floyd-warshall'), _dereq_('./bellman-ford'), _dereq_('./kerger-stein'), _dereq_('./page-rank'), _dereq_('./degree-centrality'), _dereq_('./closeness-centrality'), _dereq_('./betweenness-centrality')].forEach(function(props) {
          util.extend(elesfn, props);
        });
        module.exports = elesfn;
      }, {
        "../../util": 94,
        "./a-star": 2,
        "./bellman-ford": 3,
        "./betweenness-centrality": 4,
        "./bfs-dfs": 5,
        "./closeness-centrality": 6,
        "./degree-centrality": 7,
        "./floyd-warshall": 8,
        "./kerger-stein": 10,
        "./page-rank": 11
      }],
      10: [function(_dereq_, module, exports) {
        'use strict';
        var util = _dereq_('../../util');
        var elesfn = ({kargerStein: function(options) {
            var eles = this;
            options = options || {};
            var colapse = function(edgeIndex, nodeMap, remainingEdges) {
              var edgeInfo = remainingEdges[edgeIndex];
              var sourceIn = edgeInfo[1];
              var targetIn = edgeInfo[2];
              var partition1 = nodeMap[sourceIn];
              var partition2 = nodeMap[targetIn];
              var newEdges = remainingEdges.filter(function(edge) {
                if (nodeMap[edge[1]] === partition1 && nodeMap[edge[2]] === partition2) {
                  return false;
                }
                if (nodeMap[edge[1]] === partition2 && nodeMap[edge[2]] === partition1) {
                  return false;
                }
                return true;
              });
              for (var i = 0; i < newEdges.length; i++) {
                var edge = newEdges[i];
                if (edge[1] === partition2) {
                  newEdges[i] = edge.slice(0);
                  newEdges[i][1] = partition1;
                } else if (edge[2] === partition2) {
                  newEdges[i] = edge.slice(0);
                  newEdges[i][2] = partition1;
                }
              }
              for (var i = 0; i < nodeMap.length; i++) {
                if (nodeMap[i] === partition2) {
                  nodeMap[i] = partition1;
                }
              }
              return newEdges;
            };
            var contractUntil = function(metaNodeMap, remainingEdges, size, sizeLimit) {
              if (size <= sizeLimit) {
                return remainingEdges;
              }
              var edgeIndex = Math.floor((Math.random() * remainingEdges.length));
              var newEdges = colapse(edgeIndex, metaNodeMap, remainingEdges);
              return contractUntil(metaNodeMap, newEdges, size - 1, sizeLimit);
            };
            var cy = this._private.cy;
            var edges = this.edges().stdFilter(function(e) {
              return !e.isLoop();
            });
            var nodes = this.nodes();
            var numNodes = nodes.length;
            var numEdges = edges.length;
            var numIter = Math.ceil(Math.pow(Math.log(numNodes) / Math.LN2, 2));
            var stopSize = Math.floor(numNodes / Math.sqrt(2));
            if (numNodes < 2) {
              util.error("At least 2 nodes are required for Karger-Stein algorithm");
              return undefined;
            }
            var id2position = {};
            for (var i = 0; i < numNodes; i++) {
              id2position[nodes[i].id()] = i;
            }
            var edgeIndexes = [];
            for (var i = 0; i < numEdges; i++) {
              var e = edges[i];
              edgeIndexes.push([i, id2position[e.source().id()], id2position[e.target().id()]]);
            }
            var minCutSize = Infinity;
            var minCut;
            var originalMetaNode = [];
            for (var i = 0; i < numNodes; i++) {
              originalMetaNode.push(i);
            }
            for (var iter = 0; iter <= numIter; iter++) {
              var metaNodeMap = originalMetaNode.slice(0);
              var edgesState = contractUntil(metaNodeMap, edgeIndexes, numNodes, stopSize);
              var metaNodeMap2 = metaNodeMap.slice(0);
              var res1 = contractUntil(metaNodeMap, edgesState, stopSize, 2);
              var res2 = contractUntil(metaNodeMap2, edgesState, stopSize, 2);
              if (res1.length <= res2.length && res1.length < minCutSize) {
                minCutSize = res1.length;
                minCut = [res1, metaNodeMap];
              } else if (res2.length <= res1.length && res2.length < minCutSize) {
                minCutSize = res2.length;
                minCut = [res2, metaNodeMap2];
              }
            }
            var resEdges = (minCut[0]).map(function(e) {
              return edges[e[0]];
            });
            var partition1 = [];
            var partition2 = [];
            var witnessNodePartition = minCut[1][0];
            for (var i = 0; i < minCut[1].length; i++) {
              var partitionId = minCut[1][i];
              if (partitionId === witnessNodePartition) {
                partition1.push(nodes[i]);
              } else {
                partition2.push(nodes[i]);
              }
            }
            var ret = {
              cut: eles.spawn(cy, resEdges),
              partition1: eles.spawn(partition1),
              partition2: eles.spawn(partition2)
            };
            return ret;
          }});
        module.exports = elesfn;
      }, {"../../util": 94}],
      11: [function(_dereq_, module, exports) {
        'use strict';
        var is = _dereq_('../../is');
        var elesfn = ({pageRank: function(options) {
            options = options || {};
            var normalizeVector = function(vector) {
              var length = vector.length;
              var total = 0;
              for (var i = 0; i < length; i++) {
                total += vector[i];
              }
              for (var i = 0; i < length; i++) {
                vector[i] = vector[i] / total;
              }
            };
            if (options != null && options.dampingFactor != null) {
              var dampingFactor = options.dampingFactor;
            } else {
              var dampingFactor = 0.8;
            }
            if (options != null && options.precision != null) {
              var epsilon = options.precision;
            } else {
              var epsilon = 0.000001;
            }
            if (options != null && options.iterations != null) {
              var numIter = options.iterations;
            } else {
              var numIter = 200;
            }
            if (options != null && options.weight != null && is.fn(options.weight)) {
              var weightFn = options.weight;
            } else {
              var weightFn = function(e) {
                return 1;
              };
            }
            var cy = this._private.cy;
            var edges = this.edges().stdFilter(function(e) {
              return !e.isLoop();
            });
            var nodes = this.nodes();
            var numNodes = nodes.length;
            var numEdges = edges.length;
            var id2position = {};
            for (var i = 0; i < numNodes; i++) {
              id2position[nodes[i].id()] = i;
            }
            var matrix = [];
            var columnSum = [];
            var additionalProb = (1 - dampingFactor) / numNodes;
            for (var i = 0; i < numNodes; i++) {
              var newRow = [];
              for (var j = 0; j < numNodes; j++) {
                newRow.push(0.0);
              }
              matrix.push(newRow);
              columnSum.push(0.0);
            }
            for (var i = 0; i < numEdges; i++) {
              var edge = edges[i];
              var s = id2position[edge.source().id()];
              var t = id2position[edge.target().id()];
              var w = weightFn.apply(edge, [edge]);
              matrix[t][s] += w;
              columnSum[s] += w;
            }
            var p = 1.0 / numNodes + additionalProb;
            for (var j = 0; j < numNodes; j++) {
              if (columnSum[j] === 0) {
                for (var i = 0; i < numNodes; i++) {
                  matrix[i][j] = p;
                }
              } else {
                for (var i = 0; i < numNodes; i++) {
                  matrix[i][j] = matrix[i][j] / columnSum[j] + additionalProb;
                }
              }
            }
            var eigenvector = [];
            var nullVector = [];
            var previous;
            for (var i = 0; i < numNodes; i++) {
              eigenvector.push(1.0);
              nullVector.push(0.0);
            }
            for (var iter = 0; iter < numIter; iter++) {
              var temp = nullVector.slice(0);
              for (var i = 0; i < numNodes; i++) {
                for (var j = 0; j < numNodes; j++) {
                  temp[i] += matrix[i][j] * eigenvector[j];
                }
              }
              normalizeVector(temp);
              previous = eigenvector;
              eigenvector = temp;
              var diff = 0;
              for (var i = 0; i < numNodes; i++) {
                diff += Math.pow(previous[i] - eigenvector[i], 2);
              }
              if (diff < epsilon) {
                break;
              }
            }
            var res = {rank: function(node) {
                if (is.string(node)) {
                  var nodeId = (cy.filter(node)[0]).id();
                } else {
                  var nodeId = node.id();
                }
                return eigenvector[id2position[nodeId]];
              }};
            return res;
          }});
        module.exports = elesfn;
      }, {"../../is": 77}],
      12: [function(_dereq_, module, exports) {
        'use strict';
        var define = _dereq_('../define');
        var elesfn = ({
          animate: define.animate(),
          animation: define.animation(),
          animated: define.animated(),
          clearQueue: define.clearQueue(),
          delay: define.delay(),
          delayAnimation: define.delayAnimation(),
          stop: define.stop()
        });
        module.exports = elesfn;
      }, {"../define": 41}],
      13: [function(_dereq_, module, exports) {
        'use strict';
        var util = _dereq_('../util');
        var elesfn = ({
          classes: function(classes) {
            classes = classes.match(/\S+/g) || [];
            var self = this;
            var changed = [];
            var classesMap = {};
            for (var i = 0; i < classes.length; i++) {
              var cls = classes[i];
              classesMap[cls] = true;
            }
            for (var j = 0; j < self.length; j++) {
              var ele = self[j];
              var _p = ele._private;
              var eleClasses = _p.classes;
              var changedEle = false;
              for (var i = 0; i < classes.length; i++) {
                var cls = classes[i];
                var eleHasClass = eleClasses[cls];
                if (!eleHasClass) {
                  changedEle = true;
                  break;
                }
              }
              if (!changedEle) {
                for (var eleCls in eleClasses) {
                  var eleHasClass = eleClasses[eleCls];
                  var specdClass = classesMap[eleCls];
                  if (eleHasClass && !specdClass) {
                    changedEle = true;
                    break;
                  }
                }
              }
              if (changedEle) {
                _p.classes = util.copy(classesMap);
                changed.push(ele);
              }
            }
            if (changed.length > 0) {
              this.spawn(changed).updateStyle().trigger('class');
              ;
            }
            return self;
          },
          addClass: function(classes) {
            return this.toggleClass(classes, true);
          },
          hasClass: function(className) {
            var ele = this[0];
            return (ele != null && ele._private.classes[className]) ? true : false;
          },
          toggleClass: function(classesStr, toggle) {
            var classes = classesStr.match(/\S+/g) || [];
            var self = this;
            var changed = [];
            for (var i = 0,
                il = self.length; i < il; i++) {
              var ele = self[i];
              var changedEle = false;
              for (var j = 0; j < classes.length; j++) {
                var cls = classes[j];
                var eleClasses = ele._private.classes;
                var hasClass = eleClasses[cls];
                var shouldAdd = toggle || (toggle === undefined && !hasClass);
                if (shouldAdd) {
                  eleClasses[cls] = true;
                  if (!hasClass && !changedEle) {
                    changed.push(ele);
                    changedEle = true;
                  }
                } else {
                  eleClasses[cls] = false;
                  if (hasClass && !changedEle) {
                    changed.push(ele);
                    changedEle = true;
                  }
                }
              }
            }
            if (changed.length > 0) {
              this.spawn(changed).updateStyle().trigger('class');
              ;
            }
            return self;
          },
          removeClass: function(classes) {
            return this.toggleClass(classes, false);
          },
          flashClass: function(classes, duration) {
            var self = this;
            if (duration == null) {
              duration = 250;
            } else if (duration === 0) {
              return self;
            }
            self.addClass(classes);
            setTimeout(function() {
              self.removeClass(classes);
            }, duration);
            return self;
          }
        });
        module.exports = elesfn;
      }, {"../util": 94}],
      14: [function(_dereq_, module, exports) {
        'use strict';
        var elesfn = ({
          allAre: function(selector) {
            return this.filter(selector).length === this.length;
          },
          is: function(selector) {
            return this.filter(selector).length > 0;
          },
          some: function(fn, thisArg) {
            for (var i = 0; i < this.length; i++) {
              var ret = !thisArg ? fn(this[i], i, this) : fn.apply(thisArg, [this[i], i, this]);
              if (ret) {
                return true;
              }
            }
            return false;
          },
          every: function(fn, thisArg) {
            for (var i = 0; i < this.length; i++) {
              var ret = !thisArg ? fn(this[i], i, this) : fn.apply(thisArg, [this[i], i, this]);
              if (!ret) {
                return false;
              }
            }
            return true;
          },
          same: function(collection) {
            collection = this.cy().collection(collection);
            if (this.length !== collection.length) {
              return false;
            }
            return this.intersect(collection).length === this.length;
          },
          anySame: function(collection) {
            collection = this.cy().collection(collection);
            return this.intersect(collection).length > 0;
          },
          allAreNeighbors: function(collection) {
            collection = this.cy().collection(collection);
            return this.neighborhood().intersect(collection).length === collection.length;
          }
        });
        elesfn.allAreNeighbours = elesfn.allAreNeighbors;
        module.exports = elesfn;
      }, {}],
      15: [function(_dereq_, module, exports) {
        'use strict';
        var elesfn = ({
          parent: function(selector) {
            var parents = [];
            var cy = this._private.cy;
            for (var i = 0; i < this.length; i++) {
              var ele = this[i];
              var parent = cy.getElementById(ele._private.data.parent);
              if (parent.size() > 0) {
                parents.push(parent);
              }
            }
            return this.spawn(parents, {unique: true}).filter(selector);
          },
          parents: function(selector) {
            var parents = [];
            var eles = this.parent();
            while (eles.nonempty()) {
              for (var i = 0; i < eles.length; i++) {
                var ele = eles[i];
                parents.push(ele);
              }
              eles = eles.parent();
            }
            return this.spawn(parents, {unique: true}).filter(selector);
          },
          commonAncestors: function(selector) {
            var ancestors;
            for (var i = 0; i < this.length; i++) {
              var ele = this[i];
              var parents = ele.parents();
              ancestors = ancestors || parents;
              ancestors = ancestors.intersect(parents);
            }
            return ancestors.filter(selector);
          },
          orphans: function(selector) {
            return this.stdFilter(function(ele) {
              return ele.isNode() && ele.parent().empty();
            }).filter(selector);
          },
          nonorphans: function(selector) {
            return this.stdFilter(function(ele) {
              return ele.isNode() && ele.parent().nonempty();
            }).filter(selector);
          },
          children: function(selector) {
            var children = [];
            for (var i = 0; i < this.length; i++) {
              var ele = this[i];
              children = children.concat(ele._private.children);
            }
            return this.spawn(children, {unique: true}).filter(selector);
          },
          siblings: function(selector) {
            return this.parent().children().not(this).filter(selector);
          },
          isParent: function() {
            var ele = this[0];
            if (ele) {
              return ele._private.children.length !== 0;
            }
          },
          isChild: function() {
            var ele = this[0];
            if (ele) {
              return ele._private.data.parent !== undefined && ele.parent().length !== 0;
            }
          },
          descendants: function(selector) {
            var elements = [];
            function add(eles) {
              for (var i = 0; i < eles.length; i++) {
                var ele = eles[i];
                elements.push(ele);
                if (ele.children().nonempty()) {
                  add(ele.children());
                }
              }
            }
            add(this.children());
            return this.spawn(elements, {unique: true}).filter(selector);
          }
        });
        elesfn.ancestors = elesfn.parents;
        module.exports = elesfn;
      }, {}],
      16: [function(_dereq_, module, exports) {
        'use strict';
        var define = _dereq_('../define');
        var fn,
            elesfn;
        fn = elesfn = ({
          data: define.data({
            field: 'data',
            bindingEvent: 'data',
            allowBinding: true,
            allowSetting: true,
            settingEvent: 'data',
            settingTriggersEvent: true,
            triggerFnName: 'trigger',
            allowGetting: true,
            immutableKeys: {
              'id': true,
              'source': true,
              'target': true,
              'parent': true
            },
            updateStyle: true
          }),
          removeData: define.removeData({
            field: 'data',
            event: 'data',
            triggerFnName: 'trigger',
            triggerEvent: true,
            immutableKeys: {
              'id': true,
              'source': true,
              'target': true,
              'parent': true
            },
            updateStyle: true
          }),
          scratch: define.data({
            field: 'scratch',
            bindingEvent: 'scratch',
            allowBinding: true,
            allowSetting: true,
            settingEvent: 'scratch',
            settingTriggersEvent: true,
            triggerFnName: 'trigger',
            allowGetting: true,
            updateStyle: true
          }),
          removeScratch: define.removeData({
            field: 'scratch',
            event: 'scratch',
            triggerFnName: 'trigger',
            triggerEvent: true,
            updateStyle: true
          }),
          rscratch: define.data({
            field: 'rscratch',
            allowBinding: false,
            allowSetting: true,
            settingTriggersEvent: false,
            allowGetting: true
          }),
          removeRscratch: define.removeData({
            field: 'rscratch',
            triggerEvent: false
          }),
          id: function() {
            var ele = this[0];
            if (ele) {
              return ele._private.data.id;
            }
          }
        });
        fn.attr = fn.data;
        fn.removeAttr = fn.removeData;
        module.exports = elesfn;
      }, {"../define": 41}],
      17: [function(_dereq_, module, exports) {
        'use strict';
        var util = _dereq_('../util');
        var elesfn = {};
        function defineDegreeFunction(callback) {
          return function(includeLoops) {
            var self = this;
            if (includeLoops === undefined) {
              includeLoops = true;
            }
            if (self.length === 0) {
              return;
            }
            if (self.isNode() && !self.removed()) {
              var degree = 0;
              var node = self[0];
              var connectedEdges = node._private.edges;
              for (var i = 0; i < connectedEdges.length; i++) {
                var edge = connectedEdges[i];
                if (!includeLoops && edge.isLoop()) {
                  continue;
                }
                degree += callback(node, edge);
              }
              return degree;
            } else {
              return;
            }
          };
        }
        util.extend(elesfn, {
          degree: defineDegreeFunction(function(node, edge) {
            if (edge.source().same(edge.target())) {
              return 2;
            } else {
              return 1;
            }
          }),
          indegree: defineDegreeFunction(function(node, edge) {
            if (edge.target().same(node)) {
              return 1;
            } else {
              return 0;
            }
          }),
          outdegree: defineDegreeFunction(function(node, edge) {
            if (edge.source().same(node)) {
              return 1;
            } else {
              return 0;
            }
          })
        });
        function defineDegreeBoundsFunction(degreeFn, callback) {
          return function(includeLoops) {
            var ret;
            var nodes = this.nodes();
            for (var i = 0; i < nodes.length; i++) {
              var ele = nodes[i];
              var degree = ele[degreeFn](includeLoops);
              if (degree !== undefined && (ret === undefined || callback(degree, ret))) {
                ret = degree;
              }
            }
            return ret;
          };
        }
        util.extend(elesfn, {
          minDegree: defineDegreeBoundsFunction('degree', function(degree, min) {
            return degree < min;
          }),
          maxDegree: defineDegreeBoundsFunction('degree', function(degree, max) {
            return degree > max;
          }),
          minIndegree: defineDegreeBoundsFunction('indegree', function(degree, min) {
            return degree < min;
          }),
          maxIndegree: defineDegreeBoundsFunction('indegree', function(degree, max) {
            return degree > max;
          }),
          minOutdegree: defineDegreeBoundsFunction('outdegree', function(degree, min) {
            return degree < min;
          }),
          maxOutdegree: defineDegreeBoundsFunction('outdegree', function(degree, max) {
            return degree > max;
          })
        });
        util.extend(elesfn, {totalDegree: function(includeLoops) {
            var total = 0;
            var nodes = this.nodes();
            for (var i = 0; i < nodes.length; i++) {
              total += nodes[i].degree(includeLoops);
            }
            return total;
          }});
        module.exports = elesfn;
      }, {"../util": 94}],
      18: [function(_dereq_, module, exports) {
        'use strict';
        var define = _dereq_('../define');
        var is = _dereq_('../is');
        var util = _dereq_('../util');
        var fn,
            elesfn;
        fn = elesfn = ({
          position: define.data({
            field: 'position',
            bindingEvent: 'position',
            allowBinding: true,
            allowSetting: true,
            settingEvent: 'position',
            settingTriggersEvent: true,
            triggerFnName: 'rtrigger',
            allowGetting: true,
            validKeys: ['x', 'y'],
            onSet: function(eles) {
              var updatedEles = eles.updateCompoundBounds();
              updatedEles.rtrigger('position');
            },
            canSet: function(ele) {
              return !ele.locked() && !ele.isParent();
            }
          }),
          silentPosition: define.data({
            field: 'position',
            bindingEvent: 'position',
            allowBinding: false,
            allowSetting: true,
            settingEvent: 'position',
            settingTriggersEvent: false,
            triggerFnName: 'trigger',
            allowGetting: true,
            validKeys: ['x', 'y'],
            onSet: function(eles) {
              eles.updateCompoundBounds();
            },
            canSet: function(ele) {
              return !ele.locked() && !ele.isParent();
            }
          }),
          positions: function(pos, silent) {
            if (is.plainObject(pos)) {
              this.position(pos);
            } else if (is.fn(pos)) {
              var fn = pos;
              for (var i = 0; i < this.length; i++) {
                var ele = this[i];
                var pos = fn.apply(ele, [i, ele]);
                if (pos && !ele.locked() && !ele.isParent()) {
                  var elePos = ele._private.position;
                  elePos.x = pos.x;
                  elePos.y = pos.y;
                }
              }
              var updatedEles = this.updateCompoundBounds();
              var toTrigger = updatedEles.length > 0 ? this.add(updatedEles) : this;
              if (silent) {
                toTrigger.trigger('position');
              } else {
                toTrigger.rtrigger('position');
              }
            }
            return this;
          },
          silentPositions: function(pos) {
            return this.positions(pos, true);
          },
          renderedPosition: function(dim, val) {
            var ele = this[0];
            var cy = this.cy();
            var zoom = cy.zoom();
            var pan = cy.pan();
            var rpos = is.plainObject(dim) ? dim : undefined;
            var setting = rpos !== undefined || (val !== undefined && is.string(dim));
            if (ele && ele.isNode()) {
              if (setting) {
                for (var i = 0; i < this.length; i++) {
                  var ele = this[i];
                  if (val !== undefined) {
                    ele._private.position[dim] = (val - pan[dim]) / zoom;
                  } else if (rpos !== undefined) {
                    ele._private.position = {
                      x: (rpos.x - pan.x) / zoom,
                      y: (rpos.y - pan.y) / zoom
                    };
                  }
                }
                this.rtrigger('position');
              } else {
                var pos = ele._private.position;
                rpos = {
                  x: pos.x * zoom + pan.x,
                  y: pos.y * zoom + pan.y
                };
                if (dim === undefined) {
                  return rpos;
                } else {
                  return rpos[dim];
                }
              }
            } else if (!setting) {
              return undefined;
            }
            return this;
          },
          relativePosition: function(dim, val) {
            var ele = this[0];
            var cy = this.cy();
            var ppos = is.plainObject(dim) ? dim : undefined;
            var setting = ppos !== undefined || (val !== undefined && is.string(dim));
            var hasCompoundNodes = cy.hasCompoundNodes();
            if (ele && ele.isNode()) {
              if (setting) {
                for (var i = 0; i < this.length; i++) {
                  var ele = this[i];
                  var parent = hasCompoundNodes ? ele.parent() : null;
                  var hasParent = parent && parent.length > 0;
                  var relativeToParent = hasParent;
                  if (hasParent) {
                    parent = parent[0];
                  }
                  var origin = relativeToParent ? parent._private.position : {
                    x: 0,
                    y: 0
                  };
                  if (val !== undefined) {
                    ele._private.position[dim] = val + origin[dim];
                  } else if (ppos !== undefined) {
                    ele._private.position = {
                      x: ppos.x + origin.x,
                      y: ppos.y + origin.y
                    };
                  }
                }
                this.rtrigger('position');
              } else {
                var pos = ele._private.position;
                var parent = hasCompoundNodes ? ele.parent() : null;
                var hasParent = parent && parent.length > 0;
                var relativeToParent = hasParent;
                if (hasParent) {
                  parent = parent[0];
                }
                var origin = relativeToParent ? parent._private.position : {
                  x: 0,
                  y: 0
                };
                ppos = {
                  x: pos.x - origin.x,
                  y: pos.y - origin.y
                };
                if (dim === undefined) {
                  return ppos;
                } else {
                  return ppos[dim];
                }
              }
            } else if (!setting) {
              return undefined;
            }
            return this;
          },
          renderedBoundingBox: function(options) {
            var bb = this.boundingBox(options);
            var cy = this.cy();
            var zoom = cy.zoom();
            var pan = cy.pan();
            var x1 = bb.x1 * zoom + pan.x;
            var x2 = bb.x2 * zoom + pan.x;
            var y1 = bb.y1 * zoom + pan.y;
            var y2 = bb.y2 * zoom + pan.y;
            return {
              x1: x1,
              x2: x2,
              y1: y1,
              y2: y2,
              w: x2 - x1,
              h: y2 - y1
            };
          },
          updateCompoundBounds: function() {
            var cy = this.cy();
            if (!cy.styleEnabled() || !cy.hasCompoundNodes()) {
              return cy.collection();
            }
            var updated = [];
            function update(parent) {
              var children = parent.children();
              var style = parent._private.style;
              var includeLabels = style['compound-sizing-wrt-labels'].value === 'include';
              var bb = children.boundingBox({
                includeLabels: includeLabels,
                includeEdges: true
              });
              var padding = {
                top: style['padding-top'].pfValue,
                bottom: style['padding-bottom'].pfValue,
                left: style['padding-left'].pfValue,
                right: style['padding-right'].pfValue
              };
              var pos = parent._private.position;
              var didUpdate = false;
              if (style['width'].value === 'auto') {
                parent._private.autoWidth = bb.w;
                pos.x = (bb.x1 + bb.x2 - padding.left + padding.right) / 2;
                didUpdate = true;
              }
              if (style['height'].value === 'auto') {
                parent._private.autoHeight = bb.h;
                pos.y = (bb.y1 + bb.y2 - padding.top + padding.bottom) / 2;
                didUpdate = true;
              }
              if (didUpdate) {
                updated.push(parent);
              }
            }
            var eles = this.parent();
            while (eles.nonempty()) {
              for (var i = 0; i < eles.length; i++) {
                var ele = eles[i];
                update(ele);
              }
              eles = eles.parent();
            }
            return this.spawn(updated);
          },
          boundingBox: function(options) {
            var eles = this;
            var cy = eles._private.cy;
            var cy_p = cy._private;
            var styleEnabled = cy_p.styleEnabled;
            options = options || util.staticEmptyObject();
            var includeNodes = options.includeNodes === undefined ? true : options.includeNodes;
            var includeEdges = options.includeEdges === undefined ? true : options.includeEdges;
            var includeLabels = options.includeLabels === undefined ? true : options.includeLabels;
            if (styleEnabled) {
              cy_p.renderer.recalculateRenderedStyle(this);
            }
            var x1 = Infinity;
            var x2 = -Infinity;
            var y1 = Infinity;
            var y2 = -Infinity;
            for (var i = 0; i < eles.length; i++) {
              var ele = eles[i];
              var _p = ele._private;
              var style = _p.style;
              var display = styleEnabled ? _p.style['display'].value : 'element';
              var isNode = _p.group === 'nodes';
              var ex1,
                  ex2,
                  ey1,
                  ey2,
                  x,
                  y;
              var includedEle = false;
              if (display === 'none') {
                continue;
              }
              if (isNode && includeNodes) {
                includedEle = true;
                var pos = _p.position;
                x = pos.x;
                y = pos.y;
                var w = ele.outerWidth();
                var halfW = w / 2;
                var h = ele.outerHeight();
                var halfH = h / 2;
                ex1 = x - halfW;
                ex2 = x + halfW;
                ey1 = y - halfH;
                ey2 = y + halfH;
                x1 = ex1 < x1 ? ex1 : x1;
                x2 = ex2 > x2 ? ex2 : x2;
                y1 = ey1 < y1 ? ey1 : y1;
                y2 = ey2 > y2 ? ey2 : y2;
              } else if (ele.isEdge() && includeEdges) {
                includedEle = true;
                var n1 = _p.source;
                var n1_p = n1._private;
                var n1pos = n1_p.position;
                var n2 = _p.target;
                var n2_p = n2._private;
                var n2pos = n2_p.position;
                var rstyle = _p.rstyle || {};
                var w = 0;
                var wHalf = 0;
                if (styleEnabled) {
                  w = style['width'].pfValue;
                  wHalf = w / 2;
                }
                ex1 = n1pos.x;
                ex2 = n2pos.x;
                ey1 = n1pos.y;
                ey2 = n2pos.y;
                if (ex1 > ex2) {
                  var temp = ex1;
                  ex1 = ex2;
                  ex2 = temp;
                }
                if (ey1 > ey2) {
                  var temp = ey1;
                  ey1 = ey2;
                  ey2 = temp;
                }
                ex1 -= wHalf;
                ex2 += wHalf;
                ey1 -= wHalf;
                ey2 += wHalf;
                x1 = ex1 < x1 ? ex1 : x1;
                x2 = ex2 > x2 ? ex2 : x2;
                y1 = ey1 < y1 ? ey1 : y1;
                y2 = ey2 > y2 ? ey2 : y2;
                if (styleEnabled) {
                  var pts = rstyle.bezierPts || rstyle.linePts || [];
                  for (var j = 0; j < pts.length; j++) {
                    var pt = pts[j];
                    ex1 = pt.x - wHalf;
                    ex2 = pt.x + wHalf;
                    ey1 = pt.y - wHalf;
                    ey2 = pt.y + wHalf;
                    x1 = ex1 < x1 ? ex1 : x1;
                    x2 = ex2 > x2 ? ex2 : x2;
                    y1 = ey1 < y1 ? ey1 : y1;
                    y2 = ey2 > y2 ? ey2 : y2;
                  }
                }
                if (styleEnabled && style['curve-style'].strValue === 'haystack') {
                  var hpts = rstyle.haystackPts;
                  ex1 = hpts[0].x;
                  ey1 = hpts[0].y;
                  ex2 = hpts[1].x;
                  ey2 = hpts[1].y;
                  if (ex1 > ex2) {
                    var temp = ex1;
                    ex1 = ex2;
                    ex2 = temp;
                  }
                  if (ey1 > ey2) {
                    var temp = ey1;
                    ey1 = ey2;
                    ey2 = temp;
                  }
                  x1 = ex1 < x1 ? ex1 : x1;
                  x2 = ex2 > x2 ? ex2 : x2;
                  y1 = ey1 < y1 ? ey1 : y1;
                  y2 = ey2 > y2 ? ey2 : y2;
                }
              }
              if (styleEnabled) {
                var _p = ele._private;
                var style = _p.style;
                var rstyle = _p.rstyle;
                var label = style['label'].strValue;
                var fontSize = style['font-size'];
                var halign = style['text-halign'];
                var valign = style['text-valign'];
                var labelWidth = rstyle.labelWidth;
                var labelHeight = rstyle.labelHeight;
                var labelX = rstyle.labelX;
                var labelY = rstyle.labelY;
                var isEdge = ele.isEdge();
                var autorotate = style['edge-text-rotation'].strValue === 'autorotate';
                if (includeLabels && label && fontSize && labelHeight != null && labelWidth != null && labelX != null && labelY != null && halign && valign) {
                  var lh = labelHeight;
                  var lw = labelWidth;
                  var lx1,
                      lx2,
                      ly1,
                      ly2;
                  if (isEdge) {
                    lx1 = labelX - lw / 2;
                    lx2 = labelX + lw / 2;
                    ly1 = labelY - lh / 2;
                    ly2 = labelY + lh / 2;
                    if (autorotate) {
                      var theta = _p.rscratch.labelAngle;
                      var cos = Math.cos(theta);
                      var sin = Math.sin(theta);
                      var rotate = function(x, y) {
                        x = x - labelX;
                        y = y - labelY;
                        return {
                          x: x * cos - y * sin + labelX,
                          y: x * sin + y * cos + labelY
                        };
                      };
                      var px1y1 = rotate(lx1, ly1);
                      var px1y2 = rotate(lx1, ly2);
                      var px2y1 = rotate(lx2, ly1);
                      var px2y2 = rotate(lx2, ly2);
                      lx1 = Math.min(px1y1.x, px1y2.x, px2y1.x, px2y2.x);
                      lx2 = Math.max(px1y1.x, px1y2.x, px2y1.x, px2y2.x);
                      ly1 = Math.min(px1y1.y, px1y2.y, px2y1.y, px2y2.y);
                      ly2 = Math.max(px1y1.y, px1y2.y, px2y1.y, px2y2.y);
                    }
                  } else {
                    switch (halign.value) {
                      case 'left':
                        lx1 = labelX - lw;
                        lx2 = labelX;
                        break;
                      case 'center':
                        lx1 = labelX - lw / 2;
                        lx2 = labelX + lw / 2;
                        break;
                      case 'right':
                        lx1 = labelX;
                        lx2 = labelX + lw;
                        break;
                    }
                    switch (valign.value) {
                      case 'top':
                        ly1 = labelY - lh;
                        ly2 = labelY;
                        break;
                      case 'center':
                        ly1 = labelY - lh / 2;
                        ly2 = labelY + lh / 2;
                        break;
                      case 'bottom':
                        ly1 = labelY;
                        ly2 = labelY + lh;
                        break;
                    }
                  }
                  x1 = lx1 < x1 ? lx1 : x1;
                  x2 = lx2 > x2 ? lx2 : x2;
                  y1 = ly1 < y1 ? ly1 : y1;
                  y2 = ly2 > y2 ? ly2 : y2;
                }
              }
            }
            var noninf = function(x) {
              if (x === Infinity || x === -Infinity) {
                return 0;
              }
              return x;
            };
            x1 = noninf(x1);
            x2 = noninf(x2);
            y1 = noninf(y1);
            y2 = noninf(y2);
            return {
              x1: x1,
              x2: x2,
              y1: y1,
              y2: y2,
              w: x2 - x1,
              h: y2 - y1
            };
          }
        });
        var defineDimFns = function(opts) {
          opts.uppercaseName = util.capitalize(opts.name);
          opts.autoName = 'auto' + opts.uppercaseName;
          opts.labelName = 'label' + opts.uppercaseName;
          opts.outerName = 'outer' + opts.uppercaseName;
          opts.uppercaseOuterName = util.capitalize(opts.outerName);
          fn[opts.name] = function dimImpl() {
            var ele = this[0];
            var _p = ele._private;
            var cy = _p.cy;
            var styleEnabled = cy._private.styleEnabled;
            if (ele) {
              if (styleEnabled) {
                var d = _p.style[opts.name];
                switch (d.strValue) {
                  case 'auto':
                    return _p[opts.autoName] || 0;
                  case 'label':
                    return _p.rstyle[opts.labelName] || 0;
                  default:
                    return d.pfValue;
                }
              } else {
                return 1;
              }
            }
          };
          fn['outer' + opts.uppercaseName] = function outerDimImpl() {
            var ele = this[0];
            var _p = ele._private;
            var cy = _p.cy;
            var styleEnabled = cy._private.styleEnabled;
            if (ele) {
              if (styleEnabled) {
                var style = _p.style;
                var dim = ele[opts.name]();
                var border = style['border-width'].pfValue;
                var padding = style[opts.paddings[0]].pfValue + style[opts.paddings[1]].pfValue;
                return dim + border + padding;
              } else {
                return 1;
              }
            }
          };
          fn['rendered' + opts.uppercaseName] = function renderedDimImpl() {
            var ele = this[0];
            if (ele) {
              var d = ele[opts.name]();
              return d * this.cy().zoom();
            }
          };
          fn['rendered' + opts.uppercaseOuterName] = function renderedOuterDimImpl() {
            var ele = this[0];
            if (ele) {
              var od = ele[opts.outerName]();
              return od * this.cy().zoom();
            }
          };
        };
        defineDimFns({
          name: 'width',
          paddings: ['padding-left', 'padding-right']
        });
        defineDimFns({
          name: 'height',
          paddings: ['padding-top', 'padding-bottom']
        });
        fn.modelPosition = fn.point = fn.position;
        fn.modelPositions = fn.points = fn.positions;
        fn.renderedPoint = fn.renderedPosition;
        fn.relativePoint = fn.relativePosition;
        fn.boundingbox = fn.boundingBox;
        fn.renderedBoundingbox = fn.renderedBoundingBox;
        module.exports = elesfn;
      }, {
        "../define": 41,
        "../is": 77,
        "../util": 94
      }],
      19: [function(_dereq_, module, exports) {
        'use strict';
        var util = _dereq_('../util');
        var is = _dereq_('../is');
        var Element = function(cy, params, restore) {
          if (!(this instanceof Element)) {
            return new Element(cy, params, restore);
          }
          var self = this;
          restore = (restore === undefined || restore ? true : false);
          if (cy === undefined || params === undefined || !is.core(cy)) {
            util.error('An element must have a core reference and parameters set');
            return;
          }
          var group = params.group;
          if (group == null) {
            if (params.data.source != null && params.data.target != null) {
              group = 'edges';
            } else {
              group = 'nodes';
            }
          }
          if (group !== 'nodes' && group !== 'edges') {
            util.error('An element must be of type `nodes` or `edges`; you specified `' + group + '`');
            return;
          }
          this.length = 1;
          this[0] = this;
          this._private = {
            cy: cy,
            single: true,
            data: params.data || {},
            position: params.position || {},
            autoWidth: undefined,
            autoHeight: undefined,
            listeners: [],
            group: group,
            style: {},
            rstyle: {},
            styleCxts: [],
            removed: true,
            selected: params.selected ? true : false,
            selectable: params.selectable === undefined ? true : (params.selectable ? true : false),
            locked: params.locked ? true : false,
            grabbed: false,
            grabbable: params.grabbable === undefined ? true : (params.grabbable ? true : false),
            active: false,
            classes: {},
            animation: {
              current: [],
              queue: []
            },
            rscratch: {},
            scratch: params.scratch || {},
            edges: [],
            children: []
          };
          if (params.renderedPosition) {
            var rpos = params.renderedPosition;
            var pan = cy.pan();
            var zoom = cy.zoom();
            this._private.position = {
              x: (rpos.x - pan.x) / zoom,
              y: (rpos.y - pan.y) / zoom
            };
          }
          if (is.string(params.classes)) {
            var classes = params.classes.split(/\s+/);
            for (var i = 0,
                l = classes.length; i < l; i++) {
              var cls = classes[i];
              if (!cls || cls === '') {
                continue;
              }
              self._private.classes[cls] = true;
            }
          }
          if (params.style || params.css) {
            cy.style().applyBypass(this, params.style || params.css);
          }
          if (restore === undefined || restore) {
            this.restore();
          }
        };
        module.exports = Element;
      }, {
        "../is": 77,
        "../util": 94
      }],
      20: [function(_dereq_, module, exports) {
        'use strict';
        var define = _dereq_('../define');
        var elesfn = ({
          on: define.on(),
          one: define.on({unbindSelfOnTrigger: true}),
          once: define.on({unbindAllBindersOnTrigger: true}),
          off: define.off(),
          trigger: define.trigger(),
          rtrigger: function(event, extraParams) {
            if (this.length === 0) {
              return;
            }
            this.cy().notify({
              type: event,
              collection: this
            });
            this.trigger(event, extraParams);
            return this;
          }
        });
        define.eventAliasesOn(elesfn);
        module.exports = elesfn;
      }, {"../define": 41}],
      21: [function(_dereq_, module, exports) {
        'use strict';
        var is = _dereq_('../is');
        var Selector = _dereq_('../selector');
        var elesfn = ({
          nodes: function(selector) {
            return this.filter(function(i, element) {
              return element.isNode();
            }).filter(selector);
          },
          edges: function(selector) {
            return this.filter(function(i, element) {
              return element.isEdge();
            }).filter(selector);
          },
          filter: function(filter) {
            if (is.fn(filter)) {
              var elements = [];
              for (var i = 0; i < this.length; i++) {
                var ele = this[i];
                if (filter.apply(ele, [i, ele])) {
                  elements.push(ele);
                }
              }
              return this.spawn(elements);
            } else if (is.string(filter) || is.elementOrCollection(filter)) {
              return Selector(filter).filter(this);
            } else if (filter === undefined) {
              return this;
            }
            return this.spawn();
          },
          not: function(toRemove) {
            if (!toRemove) {
              return this;
            } else {
              if (is.string(toRemove)) {
                toRemove = this.filter(toRemove);
              }
              var elements = [];
              for (var i = 0; i < this.length; i++) {
                var element = this[i];
                var remove = toRemove._private.ids[element.id()];
                if (!remove) {
                  elements.push(element);
                }
              }
              return this.spawn(elements);
            }
          },
          absoluteComplement: function() {
            var cy = this._private.cy;
            return cy.elements().not(this);
          },
          intersect: function(other) {
            if (is.string(other)) {
              var selector = other;
              return this.filter(selector);
            }
            var elements = [];
            var col1 = this;
            var col2 = other;
            var col1Smaller = this.length < other.length;
            var ids2 = col1Smaller ? col2._private.ids : col1._private.ids;
            var col = col1Smaller ? col1 : col2;
            for (var i = 0; i < col.length; i++) {
              var id = col[i]._private.data.id;
              var ele = ids2[id];
              if (ele) {
                elements.push(ele);
              }
            }
            return this.spawn(elements);
          },
          xor: function(other) {
            var cy = this._private.cy;
            if (is.string(other)) {
              other = cy.$(other);
            }
            var elements = [];
            var col1 = this;
            var col2 = other;
            var add = function(col, other) {
              for (var i = 0; i < col.length; i++) {
                var ele = col[i];
                var id = ele._private.data.id;
                var inOther = other._private.ids[id];
                if (!inOther) {
                  elements.push(ele);
                }
              }
            };
            add(col1, col2);
            add(col2, col1);
            return this.spawn(elements);
          },
          diff: function(other) {
            var cy = this._private.cy;
            if (is.string(other)) {
              other = cy.$(other);
            }
            var left = [];
            var right = [];
            var both = [];
            var col1 = this;
            var col2 = other;
            var add = function(col, other, retEles) {
              for (var i = 0; i < col.length; i++) {
                var ele = col[i];
                var id = ele._private.data.id;
                var inOther = other._private.ids[id];
                if (inOther) {
                  both.push(ele);
                } else {
                  retEles.push(ele);
                }
              }
            };
            add(col1, col2, left);
            add(col2, col1, right);
            return {
              left: this.spawn(left, {unique: true}),
              right: this.spawn(right, {unique: true}),
              both: this.spawn(both, {unique: true})
            };
          },
          add: function(toAdd) {
            var cy = this._private.cy;
            if (!toAdd) {
              return this;
            }
            if (is.string(toAdd)) {
              var selector = toAdd;
              toAdd = cy.elements(selector);
            }
            var elements = [];
            for (var i = 0; i < this.length; i++) {
              elements.push(this[i]);
            }
            for (var i = 0; i < toAdd.length; i++) {
              var add = !this._private.ids[toAdd[i].id()];
              if (add) {
                elements.push(toAdd[i]);
              }
            }
            return this.spawn(elements);
          },
          merge: function(toAdd) {
            var _p = this._private;
            var cy = _p.cy;
            if (!toAdd) {
              return this;
            }
            if (is.string(toAdd)) {
              var selector = toAdd;
              toAdd = cy.elements(selector);
            }
            for (var i = 0; i < toAdd.length; i++) {
              var toAddEle = toAdd[i];
              var id = toAddEle.id();
              var add = !_p.ids[id];
              if (add) {
                var index = this.length++;
                this[index] = toAddEle;
                _p.ids[id] = toAddEle;
                _p.indexes[id] = index;
              }
            }
            return this;
          },
          unmergeOne: function(ele) {
            ele = ele[0];
            var _p = this._private;
            var id = ele.id();
            var i = _p.indexes[id];
            if (i == null) {
              return this;
            }
            this[i] = undefined;
            _p.ids[id] = undefined;
            _p.indexes[id] = undefined;
            var unmergedLastEle = i === this.length - 1;
            if (this.length > 1 && !unmergedLastEle) {
              var lastEleI = this.length - 1;
              var lastEle = this[lastEleI];
              this[lastEleI] = undefined;
              this[i] = lastEle;
              _p.indexes[lastEle.id()] = i;
            }
            this.length--;
            return this;
          },
          unmerge: function(toRemove) {
            var cy = this._private.cy;
            if (!toRemove) {
              return this;
            }
            if (is.string(toRemove)) {
              var selector = toRemove;
              toRemove = cy.elements(selector);
            }
            for (var i = 0; i < toRemove.length; i++) {
              this.unmergeOne(toRemove[i]);
            }
            return this;
          },
          map: function(mapFn, thisArg) {
            var arr = [];
            var eles = this;
            for (var i = 0; i < eles.length; i++) {
              var ele = eles[i];
              var ret = thisArg ? mapFn.apply(thisArg, [ele, i, eles]) : mapFn(ele, i, eles);
              arr.push(ret);
            }
            return arr;
          },
          stdFilter: function(fn, thisArg) {
            var filterEles = [];
            var eles = this;
            for (var i = 0; i < eles.length; i++) {
              var ele = eles[i];
              var include = thisArg ? fn.apply(thisArg, [ele, i, eles]) : fn(ele, i, eles);
              if (include) {
                filterEles.push(ele);
              }
            }
            return this.spawn(filterEles);
          },
          max: function(valFn, thisArg) {
            var max = -Infinity;
            var maxEle;
            var eles = this;
            for (var i = 0; i < eles.length; i++) {
              var ele = eles[i];
              var val = thisArg ? valFn.apply(thisArg, [ele, i, eles]) : valFn(ele, i, eles);
              if (val > max) {
                max = val;
                maxEle = ele;
              }
            }
            return {
              value: max,
              ele: maxEle
            };
          },
          min: function(valFn, thisArg) {
            var min = Infinity;
            var minEle;
            var eles = this;
            for (var i = 0; i < eles.length; i++) {
              var ele = eles[i];
              var val = thisArg ? valFn.apply(thisArg, [ele, i, eles]) : valFn(ele, i, eles);
              if (val < min) {
                min = val;
                minEle = ele;
              }
            }
            return {
              value: min,
              ele: minEle
            };
          }
        });
        var fn = elesfn;
        fn['u'] = fn['|'] = fn['+'] = fn.union = fn.or = fn.add;
        fn['\\'] = fn['!'] = fn['-'] = fn.difference = fn.relativeComplement = fn.subtract = fn.not;
        fn['n'] = fn['&'] = fn['.'] = fn.and = fn.intersection = fn.intersect;
        fn['^'] = fn['(+)'] = fn['(-)'] = fn.symmetricDifference = fn.symdiff = fn.xor;
        fn.fnFilter = fn.filterFn = fn.stdFilter;
        fn.complement = fn.abscomp = fn.absoluteComplement;
        module.exports = elesfn;
      }, {
        "../is": 77,
        "../selector": 81
      }],
      22: [function(_dereq_, module, exports) {
        'use strict';
        var elesfn = ({
          isNode: function() {
            return this.group() === 'nodes';
          },
          isEdge: function() {
            return this.group() === 'edges';
          },
          isLoop: function() {
            return this.isEdge() && this.source().id() === this.target().id();
          },
          isSimple: function() {
            return this.isEdge() && this.source().id() !== this.target().id();
          },
          group: function() {
            var ele = this[0];
            if (ele) {
              return ele._private.group;
            }
          }
        });
        module.exports = elesfn;
      }, {}],
      23: [function(_dereq_, module, exports) {
        'use strict';
        var util = _dereq_('../util');
        var is = _dereq_('../is');
        var Element = _dereq_('./element');
        var idFactory = {
          prefix: 'ele',
          id: 0,
          generate: function(cy, element, tryThisId) {
            var json = is.element(element) ? element._private : element;
            var id = tryThisId != null ? tryThisId : this.prefix + this.id;
            if (cy.getElementById(id).empty()) {
              this.id++;
            } else {
              while (!cy.getElementById(id).empty()) {
                id = this.prefix + (++this.id);
              }
            }
            return id;
          }
        };
        var Collection = function(cy, elements, options) {
          if (!(this instanceof Collection)) {
            return new Collection(cy, elements, options);
          }
          if (cy === undefined || !is.core(cy)) {
            util.error('A collection must have a reference to the core');
            return;
          }
          var ids = {};
          var indexes = {};
          var createdElements = false;
          if (!elements) {
            elements = [];
          } else if (elements.length > 0 && is.plainObject(elements[0]) && !is.element(elements[0])) {
            createdElements = true;
            var eles = [];
            var elesIds = {};
            for (var i = 0,
                l = elements.length; i < l; i++) {
              var json = elements[i];
              if (json.data == null) {
                json.data = {};
              }
              var data = json.data;
              if (data.id == null) {
                data.id = idFactory.generate(cy, json);
              } else if (cy.getElementById(data.id).length !== 0 || elesIds[data.id]) {
                continue;
              }
              var ele = new Element(cy, json, false);
              eles.push(ele);
              elesIds[data.id] = true;
            }
            elements = eles;
          }
          this.length = 0;
          for (var i = 0,
              l = elements.length; i < l; i++) {
            var element = elements[i];
            if (!element) {
              continue;
            }
            var id = element._private.data.id;
            if (!options || (options.unique && !ids[id])) {
              ids[id] = element;
              indexes[id] = this.length;
              this[this.length] = element;
              this.length++;
            }
          }
          this._private = {
            cy: cy,
            ids: ids,
            indexes: indexes
          };
          if (createdElements) {
            this.restore();
          }
        };
        var elesfn = Element.prototype = Collection.prototype;
        elesfn.instanceString = function() {
          return 'collection';
        };
        elesfn.spawn = function(cy, eles, opts) {
          if (!is.core(cy)) {
            opts = eles;
            eles = cy;
            cy = this.cy();
          }
          return new Collection(cy, eles, opts);
        };
        elesfn.cy = function() {
          return this._private.cy;
        };
        elesfn.element = function() {
          return this[0];
        };
        elesfn.collection = function() {
          if (is.collection(this)) {
            return this;
          } else {
            return new Collection(this._private.cy, [this]);
          }
        };
        elesfn.unique = function() {
          return new Collection(this._private.cy, this, {unique: true});
        };
        elesfn.getElementById = function(id) {
          var cy = this._private.cy;
          var ele = this._private.ids[id];
          return ele ? ele : new Collection(cy);
        };
        elesfn.json = function(obj) {
          var ele = this.element();
          var cy = this.cy();
          if (ele == null && obj) {
            return this;
          }
          if (ele == null) {
            return undefined;
          }
          var p = ele._private;
          if (is.plainObject(obj)) {
            cy.startBatch();
            if (obj.data) {
              ele.data(obj.data);
            }
            if (obj.position) {
              ele.position(obj.position);
            }
            var checkSwitch = function(k, trueFnName, falseFnName) {
              var obj_k = obj[k];
              if (obj_k != null && obj_k !== p[k]) {
                if (obj_k) {
                  ele[trueFnName]();
                } else {
                  ele[falseFnName]();
                }
              }
            };
            checkSwitch('removed', 'remove', 'restore');
            checkSwitch('selected', 'select', 'unselect');
            checkSwitch('selectable', 'selectify', 'unselectify');
            checkSwitch('locked', 'lock', 'unlock');
            checkSwitch('grabbable', 'grabify', 'ungrabify');
            if (obj.classes != null) {
              ele.classes(obj.classes);
            }
            cy.endBatch();
            return this;
          } else if (obj === undefined) {
            var json = {
              data: util.copy(p.data),
              position: util.copy(p.position),
              group: p.group,
              removed: p.removed,
              selected: p.selected,
              selectable: p.selectable,
              locked: p.locked,
              grabbable: p.grabbable,
              classes: null
            };
            var classes = [];
            for (var cls in p.classes) {
              if (p.classes[cls]) {
                classes.push(cls);
              }
            }
            json.classes = classes.join(' ');
            return json;
          }
        };
        elesfn.jsons = function() {
          var jsons = [];
          for (var i = 0; i < this.length; i++) {
            var ele = this[i];
            var json = ele.json();
            jsons.push(json);
          }
          return jsons;
        };
        elesfn.clone = function() {
          var cy = this.cy();
          var elesArr = [];
          for (var i = 0; i < this.length; i++) {
            var ele = this[i];
            var json = ele.json();
            var clone = new Element(cy, json, false);
            elesArr.push(clone);
          }
          return new Collection(cy, elesArr);
        };
        elesfn.copy = elesfn.clone;
        elesfn.restore = function(notifyRenderer) {
          var self = this;
          var restored = [];
          var cy = self.cy();
          if (notifyRenderer === undefined) {
            notifyRenderer = true;
          }
          var elements = [];
          var nodes = [],
              edges = [];
          var numNodes = 0;
          var numEdges = 0;
          for (var i = 0,
              l = self.length; i < l; i++) {
            var ele = self[i];
            if (ele.isNode()) {
              nodes.push(ele);
              numNodes++;
            } else {
              edges.push(ele);
              numEdges++;
            }
          }
          elements = nodes.concat(edges);
          for (var i = 0,
              l = elements.length; i < l; i++) {
            var ele = elements[i];
            if (!ele.removed()) {
              continue;
            }
            var _private = ele._private;
            var data = _private.data;
            if (data.id === undefined) {
              data.id = idFactory.generate(cy, ele);
            } else if (is.number(data.id)) {
              data.id = '' + data.id;
            } else if (is.emptyString(data.id) || !is.string(data.id)) {
              util.error('Can not create element with invalid string ID `' + data.id + '`');
              continue;
            } else if (cy.getElementById(data.id).length !== 0) {
              util.error('Can not create second element with ID `' + data.id + '`');
              continue;
            }
            var id = data.id;
            if (ele.isNode()) {
              var node = ele;
              var pos = _private.position;
              if (pos.x == null) {
                pos.x = 0;
              }
              if (pos.y == null) {
                pos.y = 0;
              }
            }
            if (ele.isEdge()) {
              var edge = ele;
              var fields = ['source', 'target'];
              var fieldsLength = fields.length;
              var badSourceOrTarget = false;
              for (var j = 0; j < fieldsLength; j++) {
                var field = fields[j];
                var val = data[field];
                if (is.number(val)) {
                  val = data[field] = '' + data[field];
                }
                if (val == null || val === '') {
                  util.error('Can not create edge `' + id + '` with unspecified ' + field);
                  badSourceOrTarget = true;
                } else if (cy.getElementById(val).empty()) {
                  util.error('Can not create edge `' + id + '` with nonexistant ' + field + ' `' + val + '`');
                  badSourceOrTarget = true;
                }
              }
              if (badSourceOrTarget) {
                continue;
              }
              var src = cy.getElementById(data.source);
              var tgt = cy.getElementById(data.target);
              src._private.edges.push(edge);
              tgt._private.edges.push(edge);
              edge._private.source = src;
              edge._private.target = tgt;
            }
            _private.ids = {};
            _private.ids[id] = ele;
            _private.removed = false;
            cy.addToPool(ele);
            restored.push(ele);
          }
          for (var i = 0; i < numNodes; i++) {
            var node = elements[i];
            var data = node._private.data;
            if (is.number(data.parent)) {
              data.parent = '' + data.parent;
            }
            var parentId = data.parent;
            var specifiedParent = parentId != null;
            if (specifiedParent) {
              var parent = cy.getElementById(parentId);
              if (parent.empty()) {
                data.parent = undefined;
              } else {
                var selfAsParent = false;
                var ancestor = parent;
                while (!ancestor.empty()) {
                  if (node.same(ancestor)) {
                    selfAsParent = true;
                    data.parent = undefined;
                    break;
                  }
                  ancestor = ancestor.parent();
                }
                if (!selfAsParent) {
                  parent[0]._private.children.push(node);
                  node._private.parent = parent[0];
                  cy._private.hasCompoundNodes = true;
                }
              }
            }
          }
          restored = new Collection(cy, restored);
          if (restored.length > 0) {
            var toUpdateStyle = restored.add(restored.connectedNodes()).add(restored.parent());
            toUpdateStyle.updateStyle(notifyRenderer);
            if (notifyRenderer) {
              restored.rtrigger('add');
            } else {
              restored.trigger('add');
            }
          }
          return self;
        };
        elesfn.removed = function() {
          var ele = this[0];
          return ele && ele._private.removed;
        };
        elesfn.inside = function() {
          var ele = this[0];
          return ele && !ele._private.removed;
        };
        elesfn.remove = function(notifyRenderer) {
          var self = this;
          var removed = [];
          var elesToRemove = [];
          var elesToRemoveIds = {};
          var cy = self._private.cy;
          if (notifyRenderer === undefined) {
            notifyRenderer = true;
          }
          function addConnectedEdges(node) {
            var edges = node._private.edges;
            for (var i = 0; i < edges.length; i++) {
              add(edges[i]);
            }
          }
          function addChildren(node) {
            var children = node._private.children;
            for (var i = 0; i < children.length; i++) {
              add(children[i]);
            }
          }
          function add(ele) {
            var alreadyAdded = elesToRemoveIds[ele.id()];
            if (alreadyAdded) {
              return;
            } else {
              elesToRemoveIds[ele.id()] = true;
            }
            if (ele.isNode()) {
              elesToRemove.push(ele);
              addConnectedEdges(ele);
              addChildren(ele);
            } else {
              elesToRemove.unshift(ele);
            }
          }
          for (var i = 0,
              l = self.length; i < l; i++) {
            var ele = self[i];
            add(ele);
          }
          function removeEdgeRef(node, edge) {
            var connectedEdges = node._private.edges;
            for (var j = 0; j < connectedEdges.length; j++) {
              var connectedEdge = connectedEdges[j];
              if (edge === connectedEdge) {
                connectedEdges.splice(j, 1);
                break;
              }
            }
          }
          function removeChildRef(parent, ele) {
            ele = ele[0];
            parent = parent[0];
            var children = parent._private.children;
            for (var j = 0; j < children.length; j++) {
              if (children[j][0] === ele[0]) {
                children.splice(j, 1);
                break;
              }
            }
          }
          for (var i = 0; i < elesToRemove.length; i++) {
            var ele = elesToRemove[i];
            ele._private.removed = true;
            cy.removeFromPool(ele);
            removed.push(ele);
            if (ele.isEdge()) {
              var src = ele.source()[0];
              var tgt = ele.target()[0];
              removeEdgeRef(src, ele);
              removeEdgeRef(tgt, ele);
            } else {
              var parent = ele.parent();
              if (parent.length !== 0) {
                removeChildRef(parent, ele);
              }
            }
          }
          var elesStillInside = cy._private.elements;
          cy._private.hasCompoundNodes = false;
          for (var i = 0; i < elesStillInside.length; i++) {
            var ele = elesStillInside[i];
            if (ele.isParent()) {
              cy._private.hasCompoundNodes = true;
              break;
            }
          }
          var removedElements = new Collection(this.cy(), removed);
          if (removedElements.size() > 0) {
            if (notifyRenderer) {
              this.cy().notify({
                type: 'remove',
                collection: removedElements
              });
            }
            removedElements.trigger('remove');
          }
          var checkedParentId = {};
          for (var i = 0; i < elesToRemove.length; i++) {
            var ele = elesToRemove[i];
            var isNode = ele._private.group === 'nodes';
            var parentId = ele._private.data.parent;
            if (isNode && parentId !== undefined && !checkedParentId[parentId]) {
              checkedParentId[parentId] = true;
              var parent = cy.getElementById(parentId);
              if (parent && parent.length !== 0 && !parent._private.removed && parent.children().length === 0) {
                parent.updateStyle();
              }
            }
          }
          return new Collection(cy, removed);
        };
        elesfn.move = function(struct) {
          var cy = this._private.cy;
          if (struct.source !== undefined || struct.target !== undefined) {
            var srcId = struct.source;
            var tgtId = struct.target;
            var srcExists = cy.getElementById(srcId).length > 0;
            var tgtExists = cy.getElementById(tgtId).length > 0;
            if (srcExists || tgtExists) {
              var jsons = this.jsons();
              this.remove();
              for (var i = 0; i < jsons.length; i++) {
                var json = jsons[i];
                if (json.group === 'edges') {
                  if (srcExists) {
                    json.data.source = srcId;
                  }
                  if (tgtExists) {
                    json.data.target = tgtId;
                  }
                }
              }
              return cy.add(jsons);
            }
          } else if (struct.parent !== undefined) {
            var parentId = struct.parent;
            var parentExists = parentId === null || cy.getElementById(parentId).length > 0;
            if (parentExists) {
              var jsons = this.jsons();
              var descs = this.descendants();
              var descsEtc = descs.merge(descs.add(this).connectedEdges());
              this.remove();
              for (var i = 0; i < this.length; i++) {
                var json = jsons[i];
                if (json.group === 'nodes') {
                  json.data.parent = parentId === null ? undefined : parentId;
                }
              }
            }
            return cy.add(jsons).merge(descsEtc.restore());
          }
          return this;
        };
        [_dereq_('./algorithms'), _dereq_('./animation'), _dereq_('./class'), _dereq_('./comparators'), _dereq_('./compounds'), _dereq_('./data'), _dereq_('./degree'), _dereq_('./dimensions'), _dereq_('./events'), _dereq_('./filter'), _dereq_('./group'), _dereq_('./index'), _dereq_('./iteration'), _dereq_('./layout'), _dereq_('./style'), _dereq_('./switch-functions'), _dereq_('./traversing')].forEach(function(props) {
          util.extend(elesfn, props);
        });
        module.exports = Collection;
      }, {
        "../is": 77,
        "../util": 94,
        "./algorithms": 9,
        "./animation": 12,
        "./class": 13,
        "./comparators": 14,
        "./compounds": 15,
        "./data": 16,
        "./degree": 17,
        "./dimensions": 18,
        "./element": 19,
        "./events": 20,
        "./filter": 21,
        "./group": 22,
        "./index": 23,
        "./iteration": 24,
        "./layout": 25,
        "./style": 26,
        "./switch-functions": 27,
        "./traversing": 28
      }],
      24: [function(_dereq_, module, exports) {
        'use strict';
        var is = _dereq_('../is');
        var zIndexSort = _dereq_('./zsort');
        var elesfn = ({
          each: function(fn) {
            if (is.fn(fn)) {
              for (var i = 0; i < this.length; i++) {
                var ele = this[i];
                var ret = fn.apply(ele, [i, ele]);
                if (ret === false) {
                  break;
                }
              }
            }
            return this;
          },
          forEach: function(fn, thisArg) {
            if (is.fn(fn)) {
              for (var i = 0; i < this.length; i++) {
                var ele = this[i];
                var ret = thisArg ? fn.apply(thisArg, [ele, i, this]) : fn(ele, i, this);
                if (ret === false) {
                  break;
                }
              }
            }
            return this;
          },
          toArray: function() {
            var array = [];
            for (var i = 0; i < this.length; i++) {
              array.push(this[i]);
            }
            return array;
          },
          slice: function(start, end) {
            var array = [];
            var thisSize = this.length;
            if (end == null) {
              end = thisSize;
            }
            if (start == null) {
              start = 0;
            }
            if (start < 0) {
              start = thisSize + start;
            }
            if (end < 0) {
              end = thisSize + end;
            }
            for (var i = start; i >= 0 && i < end && i < thisSize; i++) {
              array.push(this[i]);
            }
            return this.spawn(array);
          },
          size: function() {
            return this.length;
          },
          eq: function(i) {
            return this[i] || this.spawn();
          },
          first: function() {
            return this[0] || this.spawn();
          },
          last: function() {
            return this[this.length - 1] || this.spawn();
          },
          empty: function() {
            return this.length === 0;
          },
          nonempty: function() {
            return !this.empty();
          },
          sort: function(sortFn) {
            if (!is.fn(sortFn)) {
              return this;
            }
            var sorted = this.toArray().sort(sortFn);
            return this.spawn(sorted);
          },
          sortByZIndex: function() {
            return this.sort(zIndexSort);
          },
          zDepth: function() {
            var ele = this[0];
            if (!ele) {
              return undefined;
            }
            var _p = ele._private;
            var group = _p.group;
            if (group === 'nodes') {
              var depth = _p.data.parent ? ele.parents().size() : 0;
              if (!ele.isParent()) {
                return Number.MAX_VALUE;
              }
              return depth;
            } else {
              var src = _p.source;
              var tgt = _p.target;
              var srcDepth = src.zDepth();
              var tgtDepth = tgt.zDepth();
              return Math.max(srcDepth, tgtDepth, 0);
            }
          }
        });
        module.exports = elesfn;
      }, {
        "../is": 77,
        "./zsort": 29
      }],
      25: [function(_dereq_, module, exports) {
        'use strict';
        var is = _dereq_('../is');
        var util = _dereq_('../util');
        var elesfn = ({
          layoutPositions: function(layout, options, fn) {
            var nodes = this.nodes();
            var cy = this.cy();
            layout.trigger({
              type: 'layoutstart',
              layout: layout
            });
            layout.animations = [];
            if (options.animate) {
              for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                var lastNode = i === nodes.length - 1;
                var newPos = fn.call(node, i, node);
                var pos = node.position();
                if (!is.number(pos.x) || !is.number(pos.y)) {
                  node.silentPosition({
                    x: 0,
                    y: 0
                  });
                }
                var ani = node.animation({
                  position: newPos,
                  duration: options.animationDuration,
                  easing: options.animationEasing,
                  step: !lastNode ? undefined : function() {
                    if (options.fit) {
                      cy.fit(options.eles, options.padding);
                    }
                  },
                  complete: !lastNode ? undefined : function() {
                    if (options.zoom != null) {
                      cy.zoom(options.zoom);
                    }
                    if (options.pan) {
                      cy.pan(options.pan);
                    }
                    if (options.fit) {
                      cy.fit(options.eles, options.padding);
                    }
                    layout.one('layoutstop', options.stop);
                    layout.trigger({
                      type: 'layoutstop',
                      layout: layout
                    });
                  }
                });
                layout.animations.push(ani);
                ani.play();
              }
              layout.one('layoutready', options.ready);
              layout.trigger({
                type: 'layoutready',
                layout: layout
              });
            } else {
              nodes.positions(fn);
              if (options.fit) {
                cy.fit(options.eles, options.padding);
              }
              if (options.zoom != null) {
                cy.zoom(options.zoom);
              }
              if (options.pan) {
                cy.pan(options.pan);
              }
              layout.one('layoutready', options.ready);
              layout.trigger({
                type: 'layoutready',
                layout: layout
              });
              layout.one('layoutstop', options.stop);
              layout.trigger({
                type: 'layoutstop',
                layout: layout
              });
            }
            return this;
          },
          layout: function(options) {
            var cy = this.cy();
            cy.layout(util.extend({}, options, {eles: this}));
            return this;
          },
          makeLayout: function(options) {
            var cy = this.cy();
            return cy.makeLayout(util.extend({}, options, {eles: this}));
          }
        });
        elesfn.createLayout = elesfn.makeLayout;
        module.exports = elesfn;
      }, {
        "../is": 77,
        "../util": 94
      }],
      26: [function(_dereq_, module, exports) {
        'use strict';
        var is = _dereq_('../is');
        var elesfn = ({
          updateStyle: function(notifyRenderer) {
            var cy = this._private.cy;
            if (!cy.styleEnabled()) {
              return this;
            }
            if (cy._private.batchingStyle) {
              var bEles = cy._private.batchStyleEles;
              bEles.merge(this);
              return this;
            }
            var style = cy.style();
            notifyRenderer = notifyRenderer || notifyRenderer === undefined ? true : false;
            style.apply(this);
            var updatedCompounds = this.updateCompoundBounds();
            var toNotify = updatedCompounds.length > 0 ? this.add(updatedCompounds) : this;
            if (notifyRenderer) {
              toNotify.rtrigger('style');
            } else {
              toNotify.trigger('style');
            }
            return this;
          },
          updateMappers: function(notifyRenderer) {
            var cy = this._private.cy;
            var style = cy.style();
            notifyRenderer = notifyRenderer || notifyRenderer === undefined ? true : false;
            if (!cy.styleEnabled()) {
              return this;
            }
            style.updateMappers(this);
            var updatedCompounds = this.updateCompoundBounds();
            var toNotify = updatedCompounds.length > 0 ? this.add(updatedCompounds) : this;
            if (notifyRenderer) {
              toNotify.rtrigger('style');
            } else {
              toNotify.trigger('style');
            }
            return this;
          },
          renderedCss: function(property) {
            var cy = this.cy();
            if (!cy.styleEnabled()) {
              return this;
            }
            var ele = this[0];
            if (ele) {
              var renstyle = ele.cy().style().getRenderedStyle(ele);
              if (property === undefined) {
                return renstyle;
              } else {
                return renstyle[property];
              }
            }
          },
          css: function(name, value) {
            var cy = this.cy();
            if (!cy.styleEnabled()) {
              return this;
            }
            var updateTransitions = false;
            var style = cy.style();
            if (is.plainObject(name)) {
              var props = name;
              style.applyBypass(this, props, updateTransitions);
              var updatedCompounds = this.updateCompoundBounds();
              var toNotify = updatedCompounds.length > 0 ? this.add(updatedCompounds) : this;
              toNotify.rtrigger('style');
            } else if (is.string(name)) {
              if (value === undefined) {
                var ele = this[0];
                if (ele) {
                  return style.getStylePropertyValue(ele, name);
                } else {
                  return;
                }
              } else {
                style.applyBypass(this, name, value, updateTransitions);
                var updatedCompounds = this.updateCompoundBounds();
                var toNotify = updatedCompounds.length > 0 ? this.add(updatedCompounds) : this;
                toNotify.rtrigger('style');
              }
            } else if (name === undefined) {
              var ele = this[0];
              if (ele) {
                return style.getRawStyle(ele);
              } else {
                return;
              }
            }
            return this;
          },
          removeCss: function(names) {
            var cy = this.cy();
            if (!cy.styleEnabled()) {
              return this;
            }
            var updateTransitions = false;
            var style = cy.style();
            var eles = this;
            if (names === undefined) {
              for (var i = 0; i < eles.length; i++) {
                var ele = eles[i];
                style.removeAllBypasses(ele, updateTransitions);
              }
            } else {
              names = names.split(/\s+/);
              for (var i = 0; i < eles.length; i++) {
                var ele = eles[i];
                style.removeBypasses(ele, names, updateTransitions);
              }
            }
            var updatedCompounds = this.updateCompoundBounds();
            var toNotify = updatedCompounds.length > 0 ? this.add(updatedCompounds) : this;
            toNotify.rtrigger('style');
            return this;
          },
          show: function() {
            this.css('display', 'element');
            return this;
          },
          hide: function() {
            this.css('display', 'none');
            return this;
          },
          visible: function() {
            var cy = this.cy();
            if (!cy.styleEnabled()) {
              return true;
            }
            var ele = this[0];
            var hasCompoundNodes = cy.hasCompoundNodes();
            if (ele) {
              var style = ele._private.style;
              if (style['visibility'].value !== 'visible' || style['display'].value !== 'element') {
                return false;
              }
              if (ele._private.group === 'nodes') {
                if (!hasCompoundNodes) {
                  return true;
                }
                var parents = ele._private.data.parent ? ele.parents() : null;
                if (parents) {
                  for (var i = 0; i < parents.length; i++) {
                    var parent = parents[i];
                    var pStyle = parent._private.style;
                    var pVis = pStyle['visibility'].value;
                    var pDis = pStyle['display'].value;
                    if (pVis !== 'visible' || pDis !== 'element') {
                      return false;
                    }
                  }
                }
                return true;
              } else {
                var src = ele._private.source;
                var tgt = ele._private.target;
                return src.visible() && tgt.visible();
              }
            }
          },
          hidden: function() {
            var ele = this[0];
            if (ele) {
              return !ele.visible();
            }
          },
          effectiveOpacity: function() {
            var cy = this.cy();
            if (!cy.styleEnabled()) {
              return 1;
            }
            var hasCompoundNodes = cy.hasCompoundNodes();
            var ele = this[0];
            if (ele) {
              var _p = ele._private;
              var parentOpacity = _p.style.opacity.value;
              if (!hasCompoundNodes) {
                return parentOpacity;
              }
              var parents = !_p.data.parent ? null : ele.parents();
              if (parents) {
                for (var i = 0; i < parents.length; i++) {
                  var parent = parents[i];
                  var opacity = parent._private.style.opacity.value;
                  parentOpacity = opacity * parentOpacity;
                }
              }
              return parentOpacity;
            }
          },
          transparent: function() {
            var cy = this.cy();
            if (!cy.styleEnabled()) {
              return false;
            }
            var ele = this[0];
            var hasCompoundNodes = ele.cy().hasCompoundNodes();
            if (ele) {
              if (!hasCompoundNodes) {
                return ele._private.style.opacity.value === 0;
              } else {
                return ele.effectiveOpacity() === 0;
              }
            }
          },
          isFullAutoParent: function() {
            var cy = this.cy();
            if (!cy.styleEnabled()) {
              return false;
            }
            var ele = this[0];
            if (ele) {
              var autoW = ele._private.style['width'].value === 'auto';
              var autoH = ele._private.style['height'].value === 'auto';
              return ele.isParent() && autoW && autoH;
            }
          },
          backgrounding: function() {
            var cy = this.cy();
            if (!cy.styleEnabled()) {
              return false;
            }
            var ele = this[0];
            return ele._private.backgrounding ? true : false;
          }
        });
        elesfn.bypass = elesfn.style = elesfn.css;
        elesfn.renderedStyle = elesfn.renderedCss;
        elesfn.removeBypass = elesfn.removeStyle = elesfn.removeCss;
        module.exports = elesfn;
      }, {"../is": 77}],
      27: [function(_dereq_, module, exports) {
        'use strict';
        var elesfn = {};
        function defineSwitchFunction(params) {
          return function() {
            var args = arguments;
            var changedEles = [];
            if (args.length === 2) {
              var data = args[0];
              var handler = args[1];
              this.bind(params.event, data, handler);
            } else if (args.length === 1) {
              var handler = args[0];
              this.bind(params.event, handler);
            } else if (args.length === 0) {
              for (var i = 0; i < this.length; i++) {
                var ele = this[i];
                var able = !params.ableField || ele._private[params.ableField];
                var changed = ele._private[params.field] != params.value;
                if (params.overrideAble) {
                  var overrideAble = params.overrideAble(ele);
                  if (overrideAble !== undefined) {
                    able = overrideAble;
                    if (!overrideAble) {
                      return this;
                    }
                  }
                }
                if (able) {
                  ele._private[params.field] = params.value;
                  if (changed) {
                    changedEles.push(ele);
                  }
                }
              }
              var changedColl = this.spawn(changedEles);
              changedColl.updateStyle();
              changedColl.trigger(params.event);
            }
            return this;
          };
        }
        function defineSwitchSet(params) {
          elesfn[params.field] = function() {
            var ele = this[0];
            if (ele) {
              if (params.overrideField) {
                var val = params.overrideField(ele);
                if (val !== undefined) {
                  return val;
                }
              }
              return ele._private[params.field];
            }
          };
          elesfn[params.on] = defineSwitchFunction({
            event: params.on,
            field: params.field,
            ableField: params.ableField,
            overrideAble: params.overrideAble,
            value: true
          });
          elesfn[params.off] = defineSwitchFunction({
            event: params.off,
            field: params.field,
            ableField: params.ableField,
            overrideAble: params.overrideAble,
            value: false
          });
        }
        defineSwitchSet({
          field: 'locked',
          overrideField: function(ele) {
            return ele.cy().autolock() ? true : undefined;
          },
          on: 'lock',
          off: 'unlock'
        });
        defineSwitchSet({
          field: 'grabbable',
          overrideField: function(ele) {
            return ele.cy().autoungrabify() ? false : undefined;
          },
          on: 'grabify',
          off: 'ungrabify'
        });
        defineSwitchSet({
          field: 'selected',
          ableField: 'selectable',
          overrideAble: function(ele) {
            return ele.cy().autounselectify() ? false : undefined;
          },
          on: 'select',
          off: 'unselect'
        });
        defineSwitchSet({
          field: 'selectable',
          overrideField: function(ele) {
            return ele.cy().autounselectify() ? false : undefined;
          },
          on: 'selectify',
          off: 'unselectify'
        });
        elesfn.deselect = elesfn.unselect;
        elesfn.grabbed = function() {
          var ele = this[0];
          if (ele) {
            return ele._private.grabbed;
          }
        };
        defineSwitchSet({
          field: 'active',
          on: 'activate',
          off: 'unactivate'
        });
        elesfn.inactive = function() {
          var ele = this[0];
          if (ele) {
            return !ele._private.active;
          }
        };
        module.exports = elesfn;
      }, {}],
      28: [function(_dereq_, module, exports) {
        'use strict';
        var util = _dereq_('../util');
        var is = _dereq_('../is');
        var elesfn = {};
        util.extend(elesfn, {
          roots: function(selector) {
            var eles = this;
            var roots = [];
            for (var i = 0; i < eles.length; i++) {
              var ele = eles[i];
              if (!ele.isNode()) {
                continue;
              }
              var hasEdgesPointingIn = ele.connectedEdges(function() {
                return this.data('target') === ele.id() && this.data('source') !== ele.id();
              }).length > 0;
              if (!hasEdgesPointingIn) {
                roots.push(ele);
              }
            }
            return this.spawn(roots, {unique: true}).filter(selector);
          },
          leaves: function(selector) {
            var eles = this;
            var leaves = [];
            for (var i = 0; i < eles.length; i++) {
              var ele = eles[i];
              if (!ele.isNode()) {
                continue;
              }
              var hasEdgesPointingOut = ele.connectedEdges(function() {
                return this.data('source') === ele.id() && this.data('target') !== ele.id();
              }).length > 0;
              if (!hasEdgesPointingOut) {
                leaves.push(ele);
              }
            }
            return this.spawn(leaves, {unique: true}).filter(selector);
          },
          outgoers: function(selector) {
            var eles = this;
            var oEles = [];
            for (var i = 0; i < eles.length; i++) {
              var ele = eles[i];
              var eleId = ele.id();
              if (!ele.isNode()) {
                continue;
              }
              var edges = ele._private.edges;
              for (var j = 0; j < edges.length; j++) {
                var edge = edges[j];
                var srcId = edge._private.data.source;
                var tgtId = edge._private.data.target;
                if (srcId === eleId && tgtId !== eleId) {
                  oEles.push(edge);
                  oEles.push(edge.target()[0]);
                }
              }
            }
            return this.spawn(oEles, {unique: true}).filter(selector);
          },
          successors: function(selector) {
            var eles = this;
            var sEles = [];
            var sElesIds = {};
            for (; ; ) {
              var outgoers = eles.outgoers();
              if (outgoers.length === 0) {
                break;
              }
              var newOutgoers = false;
              for (var i = 0; i < outgoers.length; i++) {
                var outgoer = outgoers[i];
                var outgoerId = outgoer.id();
                if (!sElesIds[outgoerId]) {
                  sElesIds[outgoerId] = true;
                  sEles.push(outgoer);
                  newOutgoers = true;
                }
              }
              if (!newOutgoers) {
                break;
              }
              eles = outgoers;
            }
            return this.spawn(sEles, {unique: true}).filter(selector);
          },
          incomers: function(selector) {
            var eles = this;
            var oEles = [];
            for (var i = 0; i < eles.length; i++) {
              var ele = eles[i];
              var eleId = ele.id();
              if (!ele.isNode()) {
                continue;
              }
              var edges = ele._private.edges;
              for (var j = 0; j < edges.length; j++) {
                var edge = edges[j];
                var srcId = edge._private.data.source;
                var tgtId = edge._private.data.target;
                if (tgtId === eleId && srcId !== eleId) {
                  oEles.push(edge);
                  oEles.push(edge.source()[0]);
                }
              }
            }
            return this.spawn(oEles, {unique: true}).filter(selector);
          },
          predecessors: function(selector) {
            var eles = this;
            var pEles = [];
            var pElesIds = {};
            for (; ; ) {
              var incomers = eles.incomers();
              if (incomers.length === 0) {
                break;
              }
              var newIncomers = false;
              for (var i = 0; i < incomers.length; i++) {
                var incomer = incomers[i];
                var incomerId = incomer.id();
                if (!pElesIds[incomerId]) {
                  pElesIds[incomerId] = true;
                  pEles.push(incomer);
                  newIncomers = true;
                }
              }
              if (!newIncomers) {
                break;
              }
              eles = incomers;
            }
            return this.spawn(pEles, {unique: true}).filter(selector);
          }
        });
        util.extend(elesfn, {
          neighborhood: function(selector) {
            var elements = [];
            var nodes = this.nodes();
            for (var i = 0; i < nodes.length; i++) {
              var node = nodes[i];
              var connectedEdges = node.connectedEdges();
              for (var j = 0; j < connectedEdges.length; j++) {
                var edge = connectedEdges[j];
                var src = edge._private.source;
                var tgt = edge._private.target;
                var otherNode = node === src ? tgt : src;
                if (otherNode.length > 0) {
                  elements.push(otherNode[0]);
                }
                elements.push(edge[0]);
              }
            }
            return (this.spawn(elements, {unique: true})).filter(selector);
          },
          closedNeighborhood: function(selector) {
            return this.neighborhood().add(this).filter(selector);
          },
          openNeighborhood: function(selector) {
            return this.neighborhood(selector);
          }
        });
        elesfn.neighbourhood = elesfn.neighborhood;
        elesfn.closedNeighbourhood = elesfn.closedNeighborhood;
        elesfn.openNeighbourhood = elesfn.openNeighborhood;
        util.extend(elesfn, {
          source: function(selector) {
            var ele = this[0];
            var src;
            if (ele) {
              src = ele._private.source;
            }
            return src && selector ? src.filter(selector) : src;
          },
          target: function(selector) {
            var ele = this[0];
            var tgt;
            if (ele) {
              tgt = ele._private.target;
            }
            return tgt && selector ? tgt.filter(selector) : tgt;
          },
          sources: defineSourceFunction({attr: 'source'}),
          targets: defineSourceFunction({attr: 'target'})
        });
        function defineSourceFunction(params) {
          return function(selector) {
            var sources = [];
            for (var i = 0; i < this.length; i++) {
              var ele = this[i];
              var src = ele._private[params.attr];
              if (src) {
                sources.push(src);
              }
            }
            return this.spawn(sources, {unique: true}).filter(selector);
          };
        }
        util.extend(elesfn, {
          edgesWith: defineEdgesWithFunction(),
          edgesTo: defineEdgesWithFunction({thisIs: 'source'})
        });
        function defineEdgesWithFunction(params) {
          return function edgesWithImpl(otherNodes) {
            var elements = [];
            var cy = this._private.cy;
            var p = params || {};
            if (is.string(otherNodes)) {
              otherNodes = cy.$(otherNodes);
            }
            var thisIds = this._private.ids;
            var otherIds = otherNodes._private.ids;
            for (var h = 0; h < otherNodes.length; h++) {
              var edges = otherNodes[h]._private.edges;
              for (var i = 0; i < edges.length; i++) {
                var edge = edges[i];
                var edgeData = edge._private.data;
                var thisToOther = thisIds[edgeData.source] && otherIds[edgeData.target];
                var otherToThis = otherIds[edgeData.source] && thisIds[edgeData.target];
                var edgeConnectsThisAndOther = thisToOther || otherToThis;
                if (!edgeConnectsThisAndOther) {
                  continue;
                }
                if (p.thisIs) {
                  if (p.thisIs === 'source' && !thisToOther) {
                    continue;
                  }
                  if (p.thisIs === 'target' && !otherToThis) {
                    continue;
                  }
                }
                elements.push(edge);
              }
            }
            return this.spawn(elements, {unique: true});
          };
        }
        util.extend(elesfn, {
          connectedEdges: function(selector) {
            var retEles = [];
            var eles = this;
            for (var i = 0; i < eles.length; i++) {
              var node = eles[i];
              if (!node.isNode()) {
                continue;
              }
              var edges = node._private.edges;
              for (var j = 0; j < edges.length; j++) {
                var edge = edges[j];
                retEles.push(edge);
              }
            }
            return this.spawn(retEles, {unique: true}).filter(selector);
          },
          connectedNodes: function(selector) {
            var retEles = [];
            var eles = this;
            for (var i = 0; i < eles.length; i++) {
              var edge = eles[i];
              if (!edge.isEdge()) {
                continue;
              }
              retEles.push(edge.source()[0]);
              retEles.push(edge.target()[0]);
            }
            return this.spawn(retEles, {unique: true}).filter(selector);
          },
          parallelEdges: defineParallelEdgesFunction(),
          codirectedEdges: defineParallelEdgesFunction({codirected: true})
        });
        function defineParallelEdgesFunction(params) {
          var defaults = {codirected: false};
          params = util.extend({}, defaults, params);
          return function(selector) {
            var elements = [];
            var edges = this.edges();
            var p = params;
            for (var i = 0; i < edges.length; i++) {
              var edge1 = edges[i];
              var src1 = edge1.source()[0];
              var srcid1 = src1.id();
              var tgt1 = edge1.target()[0];
              var tgtid1 = tgt1.id();
              var srcEdges1 = src1._private.edges;
              for (var j = 0; j < srcEdges1.length; j++) {
                var edge2 = srcEdges1[j];
                var edge2data = edge2._private.data;
                var tgtid2 = edge2data.target;
                var srcid2 = edge2data.source;
                var codirected = tgtid2 === tgtid1 && srcid2 === srcid1;
                var oppdirected = srcid1 === tgtid2 && tgtid1 === srcid2;
                if ((p.codirected && codirected) || (!p.codirected && (codirected || oppdirected))) {
                  elements.push(edge2);
                }
              }
            }
            return this.spawn(elements, {unique: true}).filter(selector);
          };
        }
        util.extend(elesfn, {components: function() {
            var cy = this.cy();
            var visited = cy.collection();
            var unvisited = this.nodes();
            var components = [];
            var visitInComponent = function(node, component) {
              visited.merge(node);
              unvisited.unmerge(node);
              component.merge(node);
            };
            do {
              var component = cy.collection();
              components.push(component);
              var root = unvisited[0];
              visitInComponent(root, component);
              this.bfs({
                directed: false,
                roots: root,
                visit: function(i, depth, v, e, u) {
                  visitInComponent(v, component);
                }
              });
            } while (unvisited.length > 0);
            return components.map(function(component) {
              var connectedEdges = component.connectedEdges().stdFilter(function(edge) {
                return component.anySame(edge.source()) && component.anySame(edge.target());
              });
              return component.union(connectedEdges);
            });
          }});
        module.exports = elesfn;
      }, {
        "../is": 77,
        "../util": 94
      }],
      29: [function(_dereq_, module, exports) {
        'use strict';
        var zIndexSort = function(a, b) {
          var cy = a.cy();
          var a_p = a._private;
          var b_p = b._private;
          var zDiff = a_p.style['z-index'].value - b_p.style['z-index'].value;
          var depthA = 0;
          var depthB = 0;
          var hasCompoundNodes = cy.hasCompoundNodes();
          var aIsNode = a_p.group === 'nodes';
          var aIsEdge = a_p.group === 'edges';
          var bIsNode = b_p.group === 'nodes';
          var bIsEdge = b_p.group === 'edges';
          if (hasCompoundNodes) {
            depthA = a.zDepth();
            depthB = b.zDepth();
          }
          var depthDiff = depthA - depthB;
          var sameDepth = depthDiff === 0;
          if (sameDepth) {
            if (aIsNode && bIsEdge) {
              return 1;
            } else if (aIsEdge && bIsNode) {
              return -1;
            } else {
              if (zDiff === 0) {
                return a_p.index - b_p.index;
              } else {
                return zDiff;
              }
            }
          } else {
            return depthDiff;
          }
        };
        module.exports = zIndexSort;
      }, {}],
      30: [function(_dereq_, module, exports) {
        'use strict';
        var is = _dereq_('../is');
        var util = _dereq_('../util');
        var Collection = _dereq_('../collection');
        var Element = _dereq_('../collection/element');
        var window = _dereq_('../window');
        var document = window ? window.document : null;
        var NullRenderer = _dereq_('../extensions/renderer/null');
        var corefn = {
          add: function(opts) {
            var elements;
            var cy = this;
            if (is.elementOrCollection(opts)) {
              var eles = opts;
              if (eles._private.cy === cy) {
                elements = eles.restore();
              } else {
                var jsons = [];
                for (var i = 0; i < eles.length; i++) {
                  var ele = eles[i];
                  jsons.push(ele.json());
                }
                elements = new Collection(cy, jsons);
              }
            } else if (is.array(opts)) {
              var jsons = opts;
              elements = new Collection(cy, jsons);
            } else if (is.plainObject(opts) && (is.array(opts.nodes) || is.array(opts.edges))) {
              var elesByGroup = opts;
              var jsons = [];
              var grs = ['nodes', 'edges'];
              for (var i = 0,
                  il = grs.length; i < il; i++) {
                var group = grs[i];
                var elesArray = elesByGroup[group];
                if (is.array(elesArray)) {
                  for (var j = 0,
                      jl = elesArray.length; j < jl; j++) {
                    var json = util.extend({group: group}, elesArray[j]);
                    jsons.push(json);
                  }
                }
              }
              elements = new Collection(cy, jsons);
            } else {
              var json = opts;
              elements = (new Element(cy, json)).collection();
            }
            return elements;
          },
          remove: function(collection) {
            if (is.elementOrCollection(collection)) {
              collection = collection;
            } else if (is.string(collection)) {
              var selector = collection;
              collection = this.$(selector);
            }
            return collection.remove();
          },
          load: function(elements, onload, ondone) {
            var cy = this;
            cy.notifications(false);
            var oldEles = cy.elements();
            if (oldEles.length > 0) {
              oldEles.remove();
            }
            if (elements != null) {
              if (is.plainObject(elements) || is.array(elements)) {
                cy.add(elements);
              }
            }
            cy.one('layoutready', function(e) {
              cy.notifications(true);
              cy.trigger(e);
              cy.notify({
                type: 'load',
                collection: cy.elements()
              });
              cy.one('load', onload);
              cy.trigger('load');
            }).one('layoutstop', function() {
              cy.one('done', ondone);
              cy.trigger('done');
            });
            var layoutOpts = util.extend({}, cy._private.options.layout);
            layoutOpts.eles = cy.$();
            cy.layout(layoutOpts);
            return this;
          }
        };
        module.exports = corefn;
      }, {
        "../collection": 23,
        "../collection/element": 19,
        "../extensions/renderer/null": 73,
        "../is": 77,
        "../util": 94,
        "../window": 100
      }],
      31: [function(_dereq_, module, exports) {
        'use strict';
        var define = _dereq_('../define');
        var util = _dereq_('../util');
        var is = _dereq_('../is');
        var corefn = ({
          animate: define.animate(),
          animation: define.animation(),
          animated: define.animated(),
          clearQueue: define.clearQueue(),
          delay: define.delay(),
          delayAnimation: define.delayAnimation(),
          stop: define.stop(),
          addToAnimationPool: function(eles) {
            var cy = this;
            if (!cy.styleEnabled()) {
              return;
            }
            cy._private.aniEles.merge(eles);
          },
          stopAnimationLoop: function() {
            this._private.animationsRunning = false;
          },
          startAnimationLoop: function() {
            var cy = this;
            cy._private.animationsRunning = true;
            if (!cy.styleEnabled()) {
              return;
            }
            function globalAnimationStep() {
              if (!cy._private.animationsRunning) {
                return;
              }
              util.requestAnimationFrame(function(now) {
                handleElements(now);
                globalAnimationStep();
              });
            }
            globalAnimationStep();
            function handleElements(now) {
              var eles = cy._private.aniEles;
              var doneEles = [];
              function handleElement(ele, isCore) {
                var _p = ele._private;
                var current = _p.animation.current;
                var queue = _p.animation.queue;
                var ranAnis = false;
                if (current.length === 0) {
                  var next = queue.shift();
                  if (next) {
                    current.push(next);
                  }
                }
                var callbacks = function(callbacks) {
                  for (var j = callbacks.length - 1; j >= 0; j--) {
                    var cb = callbacks[j];
                    cb();
                  }
                  callbacks.splice(0, callbacks.length);
                };
                for (var i = current.length - 1; i >= 0; i--) {
                  var ani = current[i];
                  var ani_p = ani._private;
                  if (ani_p.stopped) {
                    current.splice(i, 1);
                    ani_p.hooked = false;
                    ani_p.playing = false;
                    ani_p.started = false;
                    callbacks(ani_p.frames);
                    continue;
                  }
                  if (!ani_p.playing && !ani_p.applying) {
                    continue;
                  }
                  if (ani_p.playing && ani_p.applying) {
                    ani_p.applying = false;
                  }
                  if (!ani_p.started) {
                    startAnimation(ele, ani, now);
                  }
                  step(ele, ani, now, isCore);
                  if (ani_p.applying) {
                    ani_p.applying = false;
                  }
                  callbacks(ani_p.frames);
                  if (ani.completed()) {
                    current.splice(i, 1);
                    ani_p.hooked = false;
                    ani_p.playing = false;
                    ani_p.started = false;
                    callbacks(ani_p.completes);
                  }
                  ranAnis = true;
                }
                if (!isCore && current.length === 0 && queue.length === 0) {
                  doneEles.push(ele);
                }
                return ranAnis;
              }
              var ranEleAni = false;
              for (var e = 0; e < eles.length; e++) {
                var ele = eles[e];
                var handledThisEle = handleElement(ele);
                ranEleAni = ranEleAni || handledThisEle;
              }
              var ranCoreAni = handleElement(cy, true);
              if (ranEleAni || ranCoreAni) {
                var toNotify;
                if (eles.length > 0) {
                  var updatedEles = eles.updateCompoundBounds();
                  toNotify = updatedEles.length > 0 ? eles.add(updatedEles) : eles;
                }
                cy.notify({
                  type: 'draw',
                  collection: toNotify
                });
              }
              eles.unmerge(doneEles);
            }
            function startAnimation(self, ani, now) {
              var isCore = is.core(self);
              var isEles = !isCore;
              var ele = self;
              var style = cy._private.style;
              var ani_p = ani._private;
              if (isEles) {
                var pos = ele._private.position;
                ani_p.startPosition = ani_p.startPosition || {
                  x: pos.x,
                  y: pos.y
                };
                ani_p.startStyle = ani_p.startStyle || style.getValueStyle(ele);
              }
              if (isCore) {
                var pan = cy._private.pan;
                ani_p.startPan = ani_p.startPan || {
                  x: pan.x,
                  y: pan.y
                };
                ani_p.startZoom = ani_p.startZoom != null ? ani_p.startZoom : cy._private.zoom;
              }
              ani_p.started = true;
              ani_p.startTime = now - ani_p.progress * ani_p.duration;
            }
            function step(self, ani, now, isCore) {
              var style = cy._private.style;
              var isEles = !isCore;
              var _p = self._private;
              var ani_p = ani._private;
              var pEasing = ani_p.easing;
              var startTime = ani_p.startTime;
              if (!ani_p.easingImpl) {
                if (pEasing == null) {
                  ani_p.easingImpl = easings['linear'];
                } else {
                  var easingVals;
                  if (is.string(pEasing)) {
                    var easingProp = style.parse('transition-timing-function', pEasing);
                    easingVals = easingProp.value;
                  } else {
                    easingVals = pEasing;
                  }
                  var name,
                      args;
                  if (is.string(easingVals)) {
                    name = easingVals;
                    args = [];
                  } else {
                    name = easingVals[1];
                    args = easingVals.slice(2).map(function(n) {
                      return +n;
                    });
                  }
                  if (args.length > 0) {
                    if (name === 'spring') {
                      args.push(ani_p.duration);
                    }
                    ani_p.easingImpl = easings[name].apply(null, args);
                  } else {
                    ani_p.easingImpl = easings[name];
                  }
                }
              }
              var easing = ani_p.easingImpl;
              var percent;
              if (ani_p.duration === 0) {
                percent = 1;
              } else {
                percent = (now - startTime) / ani_p.duration;
              }
              if (ani_p.applying) {
                percent = ani_p.progress;
              }
              if (percent < 0) {
                percent = 0;
              } else if (percent > 1) {
                percent = 1;
              }
              if (ani_p.delay == null) {
                var startPos = ani_p.startPosition;
                var endPos = ani_p.position;
                var pos = _p.position;
                if (endPos && isEles) {
                  if (valid(startPos.x, endPos.x)) {
                    pos.x = ease(startPos.x, endPos.x, percent, easing);
                  }
                  if (valid(startPos.y, endPos.y)) {
                    pos.y = ease(startPos.y, endPos.y, percent, easing);
                  }
                }
                var startPan = ani_p.startPan;
                var endPan = ani_p.pan;
                var pan = _p.pan;
                var animatingPan = endPan != null && isCore;
                if (animatingPan) {
                  if (valid(startPan.x, endPan.x)) {
                    pan.x = ease(startPan.x, endPan.x, percent, easing);
                  }
                  if (valid(startPan.y, endPan.y)) {
                    pan.y = ease(startPan.y, endPan.y, percent, easing);
                  }
                  self.trigger('pan');
                }
                var startZoom = ani_p.startZoom;
                var endZoom = ani_p.zoom;
                var animatingZoom = endZoom != null && isCore;
                if (animatingZoom) {
                  if (valid(startZoom, endZoom)) {
                    _p.zoom = ease(startZoom, endZoom, percent, easing);
                  }
                  self.trigger('zoom');
                }
                if (animatingPan || animatingZoom) {
                  self.trigger('viewport');
                }
                var props = ani_p.style;
                if (props && isEles) {
                  for (var i = 0; i < props.length; i++) {
                    var prop = props[i];
                    var name = prop.name;
                    var end = prop;
                    var start = ani_p.startStyle[name];
                    var easedVal = ease(start, end, percent, easing);
                    style.overrideBypass(self, name, easedVal);
                  }
                }
              }
              if (is.fn(ani_p.step)) {
                ani_p.step.apply(self, [now]);
              }
              ani_p.progress = percent;
              return percent;
            }
            function valid(start, end) {
              if (start == null || end == null) {
                return false;
              }
              if (is.number(start) && is.number(end)) {
                return true;
              } else if ((start) && (end)) {
                return true;
              }
              return false;
            }
            function evalCubicBezier(p1, p2, t) {
              var one_t = 1 - t;
              var tsq = t * t;
              return (3 * one_t * one_t * t * p1) + (3 * one_t * tsq * p2) + tsq * t;
            }
            function cubicBezier(p1, p2) {
              return function(start, end, percent) {
                return start + (end - start) * evalCubicBezier(p1, p2, percent);
              };
            }
            var generateSpringRK4 = (function() {
              function springAccelerationForState(state) {
                return (-state.tension * state.x) - (state.friction * state.v);
              }
              function springEvaluateStateWithDerivative(initialState, dt, derivative) {
                var state = {
                  x: initialState.x + derivative.dx * dt,
                  v: initialState.v + derivative.dv * dt,
                  tension: initialState.tension,
                  friction: initialState.friction
                };
                return {
                  dx: state.v,
                  dv: springAccelerationForState(state)
                };
              }
              function springIntegrateState(state, dt) {
                var a = {
                  dx: state.v,
                  dv: springAccelerationForState(state)
                },
                    b = springEvaluateStateWithDerivative(state, dt * 0.5, a),
                    c = springEvaluateStateWithDerivative(state, dt * 0.5, b),
                    d = springEvaluateStateWithDerivative(state, dt, c),
                    dxdt = 1.0 / 6.0 * (a.dx + 2.0 * (b.dx + c.dx) + d.dx),
                    dvdt = 1.0 / 6.0 * (a.dv + 2.0 * (b.dv + c.dv) + d.dv);
                state.x = state.x + dxdt * dt;
                state.v = state.v + dvdt * dt;
                return state;
              }
              return function springRK4Factory(tension, friction, duration) {
                var initState = {
                  x: -1,
                  v: 0,
                  tension: null,
                  friction: null
                },
                    path = [0],
                    time_lapsed = 0,
                    tolerance = 1 / 10000,
                    DT = 16 / 1000,
                    have_duration,
                    dt,
                    last_state;
                tension = parseFloat(tension) || 500;
                friction = parseFloat(friction) || 20;
                duration = duration || null;
                initState.tension = tension;
                initState.friction = friction;
                have_duration = duration !== null;
                if (have_duration) {
                  time_lapsed = springRK4Factory(tension, friction);
                  dt = time_lapsed / duration * DT;
                } else {
                  dt = DT;
                }
                while (true) {
                  last_state = springIntegrateState(last_state || initState, dt);
                  path.push(1 + last_state.x);
                  time_lapsed += 16;
                  if (!(Math.abs(last_state.x) > tolerance && Math.abs(last_state.v) > tolerance)) {
                    break;
                  }
                }
                return !have_duration ? time_lapsed : function(percentComplete) {
                  return path[(percentComplete * (path.length - 1)) | 0];
                };
              };
            }());
            var easings = {
              'linear': function(start, end, percent) {
                return start + (end - start) * percent;
              },
              'ease': cubicBezier(0.25, 0.1, 0.25, 1),
              'ease-in': cubicBezier(0.42, 0, 1, 1),
              'ease-out': cubicBezier(0, 0, 0.58, 1),
              'ease-in-out': cubicBezier(0.42, 0, 0.58, 1),
              'ease-in-sine': cubicBezier(0.47, 0, 0.745, 0.715),
              'ease-out-sine': cubicBezier(0.39, 0.575, 0.565, 1),
              'ease-in-out-sine': cubicBezier(0.445, 0.05, 0.55, 0.95),
              'ease-in-quad': cubicBezier(0.55, 0.085, 0.68, 0.53),
              'ease-out-quad': cubicBezier(0.25, 0.46, 0.45, 0.94),
              'ease-in-out-quad': cubicBezier(0.455, 0.03, 0.515, 0.955),
              'ease-in-cubic': cubicBezier(0.55, 0.055, 0.675, 0.19),
              'ease-out-cubic': cubicBezier(0.215, 0.61, 0.355, 1),
              'ease-in-out-cubic': cubicBezier(0.645, 0.045, 0.355, 1),
              'ease-in-quart': cubicBezier(0.895, 0.03, 0.685, 0.22),
              'ease-out-quart': cubicBezier(0.165, 0.84, 0.44, 1),
              'ease-in-out-quart': cubicBezier(0.77, 0, 0.175, 1),
              'ease-in-quint': cubicBezier(0.755, 0.05, 0.855, 0.06),
              'ease-out-quint': cubicBezier(0.23, 1, 0.32, 1),
              'ease-in-out-quint': cubicBezier(0.86, 0, 0.07, 1),
              'ease-in-expo': cubicBezier(0.95, 0.05, 0.795, 0.035),
              'ease-out-expo': cubicBezier(0.19, 1, 0.22, 1),
              'ease-in-out-expo': cubicBezier(1, 0, 0, 1),
              'ease-in-circ': cubicBezier(0.6, 0.04, 0.98, 0.335),
              'ease-out-circ': cubicBezier(0.075, 0.82, 0.165, 1),
              'ease-in-out-circ': cubicBezier(0.785, 0.135, 0.15, 0.86),
              'spring': function(tension, friction, duration) {
                if (duration === 0) {
                  return easings.linear;
                }
                var spring = generateSpringRK4(tension, friction, duration);
                return function(start, end, percent) {
                  return start + (end - start) * spring(percent);
                };
              },
              'cubic-bezier': function(x1, y1, x2, y2) {
                return cubicBezier(x1, y1, x2, y2);
              }
            };
            function ease(startProp, endProp, percent, easingFn) {
              if (percent < 0) {
                percent = 0;
              } else if (percent > 1) {
                percent = 1;
              }
              var start,
                  end;
              if (startProp.pfValue != null || startProp.value != null) {
                start = startProp.pfValue != null ? startProp.pfValue : startProp.value;
              } else {
                start = startProp;
              }
              if (endProp.pfValue != null || endProp.value != null) {
                end = endProp.pfValue != null ? endProp.pfValue : endProp.value;
              } else {
                end = endProp;
              }
              if (is.number(start) && is.number(end)) {
                return easingFn(start, end, percent);
              } else if (is.array(start) && is.array(end)) {
                var easedArr = [];
                for (var i = 0; i < end.length; i++) {
                  var si = start[i];
                  var ei = end[i];
                  if (si != null && ei != null) {
                    var val = easingFn(si, ei, percent);
                    if (startProp.roundValue) {
                      val = Math.round(val);
                    }
                    easedArr.push(val);
                  } else {
                    easedArr.push(ei);
                  }
                }
                return easedArr;
              }
              return undefined;
            }
          }
        });
        module.exports = corefn;
      }, {
        "../define": 41,
        "../is": 77,
        "../util": 94
      }],
      32: [function(_dereq_, module, exports) {
        'use strict';
        var define = _dereq_('../define');
        var corefn = ({
          on: define.on(),
          one: define.on({unbindSelfOnTrigger: true}),
          once: define.on({unbindAllBindersOnTrigger: true}),
          off: define.off(),
          trigger: define.trigger()
        });
        define.eventAliasesOn(corefn);
        module.exports = corefn;
      }, {"../define": 41}],
      33: [function(_dereq_, module, exports) {
        'use strict';
        var corefn = ({
          png: function(options) {
            var renderer = this._private.renderer;
            options = options || {};
            return renderer.png(options);
          },
          jpg: function(options) {
            var renderer = this._private.renderer;
            options = options || {};
            options.bg = options.bg || '#fff';
            return renderer.jpg(options);
          }
        });
        corefn.jpeg = corefn.jpg;
        module.exports = corefn;
      }, {}],
      34: [function(_dereq_, module, exports) {
        'use strict';
        var window = _dereq_('../window');
        var util = _dereq_('../util');
        var Collection = _dereq_('../collection');
        var is = _dereq_('../is');
        var Promise = _dereq_('../promise');
        var define = _dereq_('../define');
        var Core = function(opts) {
          if (!(this instanceof Core)) {
            return new Core(opts);
          }
          var cy = this;
          opts = util.extend({}, opts);
          var container = opts.container;
          if (container && !is.htmlElement(container) && is.htmlElement(container[0])) {
            container = container[0];
          }
          var reg = container ? container._cyreg : null;
          reg = reg || {};
          if (reg && reg.cy) {
            reg.cy.destroy();
            reg = {};
          }
          var readies = reg.readies = reg.readies || [];
          if (container) {
            container._cyreg = reg;
          }
          reg.cy = cy;
          var head = window !== undefined && container !== undefined && !opts.headless;
          var options = opts;
          options.layout = util.extend({name: head ? 'grid' : 'null'}, options.layout);
          options.renderer = util.extend({name: head ? 'canvas' : 'null'}, options.renderer);
          var defVal = function(def, val, altVal) {
            if (val !== undefined) {
              return val;
            } else if (altVal !== undefined) {
              return altVal;
            } else {
              return def;
            }
          };
          var _p = this._private = {
            container: container,
            ready: false,
            initrender: false,
            options: options,
            elements: [],
            id2index: {},
            listeners: [],
            onRenders: [],
            aniEles: Collection(this),
            scratch: {},
            layout: null,
            renderer: null,
            notificationsEnabled: true,
            minZoom: 1e-50,
            maxZoom: 1e50,
            zoomingEnabled: defVal(true, options.zoomingEnabled),
            userZoomingEnabled: defVal(true, options.userZoomingEnabled),
            panningEnabled: defVal(true, options.panningEnabled),
            userPanningEnabled: defVal(true, options.userPanningEnabled),
            boxSelectionEnabled: defVal(true, options.boxSelectionEnabled),
            autolock: defVal(false, options.autolock, options.autolockNodes),
            autoungrabify: defVal(false, options.autoungrabify, options.autoungrabifyNodes),
            autounselectify: defVal(false, options.autounselectify),
            styleEnabled: options.styleEnabled === undefined ? head : options.styleEnabled,
            zoom: is.number(options.zoom) ? options.zoom : 1,
            pan: {
              x: is.plainObject(options.pan) && is.number(options.pan.x) ? options.pan.x : 0,
              y: is.plainObject(options.pan) && is.number(options.pan.y) ? options.pan.y : 0
            },
            animation: {
              current: [],
              queue: []
            },
            hasCompoundNodes: false,
            deferredExecQueue: []
          };
          var selType = options.selectionType;
          if (selType === undefined || (selType !== 'additive' && selType !== 'single')) {
            _p.selectionType = 'single';
          } else {
            _p.selectionType = selType;
          }
          if (is.number(options.minZoom) && is.number(options.maxZoom) && options.minZoom < options.maxZoom) {
            _p.minZoom = options.minZoom;
            _p.maxZoom = options.maxZoom;
          } else if (is.number(options.minZoom) && options.maxZoom === undefined) {
            _p.minZoom = options.minZoom;
          } else if (is.number(options.maxZoom) && options.minZoom === undefined) {
            _p.maxZoom = options.maxZoom;
          }
          var loadExtData = function(next) {
            var anyIsPromise = false;
            for (var i = 0; i < extData.length; i++) {
              var datum = extData[i];
              if (is.promise(datum)) {
                anyIsPromise = true;
                break;
              }
            }
            if (anyIsPromise) {
              return Promise.all(extData).then(next);
            } else {
              next(extData);
            }
          };
          cy.initRenderer(util.extend({
            hideEdgesOnViewport: options.hideEdgesOnViewport,
            hideLabelsOnViewport: options.hideLabelsOnViewport,
            textureOnViewport: options.textureOnViewport,
            wheelSensitivity: is.number(options.wheelSensitivity) && options.wheelSensitivity > 0 ? options.wheelSensitivity : 1,
            motionBlur: options.motionBlur === undefined ? true : options.motionBlur,
            motionBlurOpacity: options.motionBlurOpacity === undefined ? 0.05 : options.motionBlurOpacity,
            pixelRatio: is.number(options.pixelRatio) && options.pixelRatio > 0 ? options.pixelRatio : undefined,
            desktopTapThreshold: options.desktopTapThreshold === undefined ? 4 : options.desktopTapThreshold,
            touchTapThreshold: options.touchTapThreshold === undefined ? 8 : options.touchTapThreshold
          }, options.renderer));
          var extData = [options.style, options.elements];
          loadExtData(function(thens) {
            var initStyle = thens[0];
            var initEles = thens[1];
            if (_p.styleEnabled) {
              cy.setStyle(initStyle);
            }
            if (options.initrender) {
              cy.on('initrender', options.initrender);
              cy.on('initrender', function() {
                _p.initrender = true;
              });
            }
            cy.load(initEles, function() {
              cy.startAnimationLoop();
              _p.ready = true;
              if (is.fn(options.ready)) {
                cy.on('ready', options.ready);
              }
              for (var i = 0; i < readies.length; i++) {
                var fn = readies[i];
                cy.on('ready', fn);
              }
              if (reg) {
                reg.readies = [];
              }
              cy.trigger('ready');
            }, options.done);
          });
        };
        var corefn = Core.prototype;
        util.extend(corefn, {
          instanceString: function() {
            return 'core';
          },
          isReady: function() {
            return this._private.ready;
          },
          ready: function(fn) {
            if (this.isReady()) {
              this.trigger('ready', [], fn);
            } else {
              this.on('ready', fn);
            }
            return this;
          },
          initrender: function() {
            return this._private.initrender;
          },
          destroy: function() {
            var cy = this;
            cy.stopAnimationLoop();
            cy.notify({type: 'destroy'});
            var domEle = cy.container();
            if (domEle) {
              domEle._cyreg = null;
              while (domEle.childNodes.length > 0) {
                domEle.removeChild(domEle.childNodes[0]);
              }
            }
            return cy;
          },
          getElementById: function(id) {
            var index = this._private.id2index[id];
            if (index !== undefined) {
              return this._private.elements[index];
            }
            return Collection(this);
          },
          selectionType: function() {
            return this._private.selectionType;
          },
          hasCompoundNodes: function() {
            return this._private.hasCompoundNodes;
          },
          styleEnabled: function() {
            return this._private.styleEnabled;
          },
          addToPool: function(eles) {
            var elements = this._private.elements;
            var id2index = this._private.id2index;
            for (var i = 0; i < eles.length; i++) {
              var ele = eles[i];
              var id = ele._private.data.id;
              var index = id2index[id];
              var alreadyInPool = index !== undefined;
              if (!alreadyInPool) {
                index = elements.length;
                elements.push(ele);
                id2index[id] = index;
                ele._private.index = index;
              }
            }
            return this;
          },
          removeFromPool: function(eles) {
            var elements = this._private.elements;
            var id2index = this._private.id2index;
            for (var i = 0; i < eles.length; i++) {
              var ele = eles[i];
              var id = ele._private.data.id;
              var index = id2index[id];
              var inPool = index !== undefined;
              if (inPool) {
                this._private.id2index[id] = undefined;
                elements.splice(index, 1);
                for (var j = index; j < elements.length; j++) {
                  var jid = elements[j]._private.data.id;
                  id2index[jid]--;
                  elements[j]._private.index--;
                }
              }
            }
          },
          container: function() {
            return this._private.container;
          },
          options: function() {
            return util.copy(this._private.options);
          },
          json: function(obj) {
            var cy = this;
            var _p = cy._private;
            if (is.plainObject(obj)) {
              cy.startBatch();
              if (obj.elements) {
                var idInJson = {};
                var updateEles = function(jsons, gr) {
                  for (var i = 0; i < jsons.length; i++) {
                    var json = jsons[i];
                    var id = json.data.id;
                    var ele = cy.getElementById(id);
                    idInJson[id] = true;
                    if (ele.length !== 0) {
                      ele.json(json);
                    } else {
                      if (gr) {
                        cy.add(util.extend({group: gr}, json));
                      } else {
                        cy.add(json);
                      }
                    }
                  }
                };
                if (is.array(obj.elements)) {
                  updateEles(obj.elements);
                } else {
                  var grs = ['nodes', 'edges'];
                  for (var i = 0; i < grs.length; i++) {
                    var gr = grs[i];
                    var elements = obj.elements[gr];
                    if (is.array(elements)) {
                      updateEles(elements, gr);
                    }
                  }
                }
                cy.elements().stdFilter(function(ele) {
                  return !idInJson[ele.id()];
                }).remove();
              }
              if (obj.style) {
                cy.style(obj.style);
              }
              if (obj.zoom != null && obj.zoom !== _p.zoom) {
                cy.zoom(obj.zoom);
              }
              if (obj.pan) {
                if (obj.pan.x !== _p.pan.x || obj.pan.y !== _p.pan.y) {
                  cy.pan(obj.pan);
                }
              }
              var fields = ['minZoom', 'maxZoom', 'zoomingEnabled', 'userZoomingEnabled', 'panningEnabled', 'userPanningEnabled', 'boxSelectionEnabled', 'autolock', 'autoungrabify', 'autounselectify'];
              for (var i = 0; i < fields.length; i++) {
                var f = fields[i];
                if (obj[f] != null) {
                  cy[f](obj[f]);
                }
              }
              cy.endBatch();
              return this;
            } else if (obj === undefined) {
              var json = {};
              json.elements = {};
              cy.elements().each(function(i, ele) {
                var group = ele.group();
                if (!json.elements[group]) {
                  json.elements[group] = [];
                }
                json.elements[group].push(ele.json());
              });
              if (this._private.styleEnabled) {
                json.style = cy.style().json();
              }
              json.zoomingEnabled = cy._private.zoomingEnabled;
              json.userZoomingEnabled = cy._private.userZoomingEnabled;
              json.zoom = cy._private.zoom;
              json.minZoom = cy._private.minZoom;
              json.maxZoom = cy._private.maxZoom;
              json.panningEnabled = cy._private.panningEnabled;
              json.userPanningEnabled = cy._private.userPanningEnabled;
              json.pan = util.copy(cy._private.pan);
              json.boxSelectionEnabled = cy._private.boxSelectionEnabled;
              json.renderer = util.copy(cy._private.options.renderer);
              json.hideEdgesOnViewport = cy._private.options.hideEdgesOnViewport;
              json.hideLabelsOnViewport = cy._private.options.hideLabelsOnViewport;
              json.textureOnViewport = cy._private.options.textureOnViewport;
              json.wheelSensitivity = cy._private.options.wheelSensitivity;
              json.motionBlur = cy._private.options.motionBlur;
              return json;
            }
          },
          scratch: define.data({
            field: 'scratch',
            bindingEvent: 'scratch',
            allowBinding: true,
            allowSetting: true,
            settingEvent: 'scratch',
            settingTriggersEvent: true,
            triggerFnName: 'trigger',
            allowGetting: true
          }),
          removeScratch: define.removeData({
            field: 'scratch',
            event: 'scratch',
            triggerFnName: 'trigger',
            triggerEvent: true
          })
        });
        [_dereq_('./add-remove'), _dereq_('./animation'), _dereq_('./events'), _dereq_('./export'), _dereq_('./layout'), _dereq_('./notification'), _dereq_('./renderer'), _dereq_('./search'), _dereq_('./style'), _dereq_('./viewport')].forEach(function(props) {
          util.extend(corefn, props);
        });
        module.exports = Core;
      }, {
        "../collection": 23,
        "../define": 41,
        "../is": 77,
        "../promise": 80,
        "../util": 94,
        "../window": 100,
        "./add-remove": 30,
        "./animation": 31,
        "./events": 32,
        "./export": 33,
        "./layout": 35,
        "./notification": 36,
        "./renderer": 37,
        "./search": 38,
        "./style": 39,
        "./viewport": 40
      }],
      35: [function(_dereq_, module, exports) {
        'use strict';
        var util = _dereq_('../util');
        var is = _dereq_('../is');
        var corefn = ({
          layout: function(params) {
            var layout = this._private.prevLayout = (params == null ? this._private.prevLayout : this.makeLayout(params));
            layout.run();
            return this;
          },
          makeLayout: function(options) {
            var cy = this;
            if (options == null) {
              util.error('Layout options must be specified to make a layout');
              return;
            }
            if (options.name == null) {
              util.error('A `name` must be specified to make a layout');
              return;
            }
            var name = options.name;
            var Layout = cy.extension('layout', name);
            if (Layout == null) {
              util.error('Can not apply layout: No such layout `' + name + '` found; did you include its JS file?');
              return;
            }
            var eles;
            if (is.string(options.eles)) {
              eles = cy.$(options.eles);
            } else {
              eles = options.eles != null ? options.eles : cy.$();
            }
            var layout = new Layout(util.extend({}, options, {
              cy: cy,
              eles: eles
            }));
            return layout;
          }
        });
        corefn.createLayout = corefn.makeLayout;
        module.exports = corefn;
      }, {
        "../is": 77,
        "../util": 94
      }],
      36: [function(_dereq_, module, exports) {
        'use strict';
        var corefn = ({
          notify: function(params) {
            var _p = this._private;
            if (_p.batchingNotify) {
              var bEles = _p.batchNotifyEles;
              var bTypes = _p.batchNotifyTypes;
              if (params.collection) {
                bEles.merge(params.collection);
              }
              if (!bTypes.ids[params.type]) {
                bTypes.push(params.type);
              }
              return;
            }
            if (!_p.notificationsEnabled) {
              return;
            }
            var renderer = this.renderer();
            renderer.notify(params);
          },
          notifications: function(bool) {
            var p = this._private;
            if (bool === undefined) {
              return p.notificationsEnabled;
            } else {
              p.notificationsEnabled = bool ? true : false;
            }
          },
          noNotifications: function(callback) {
            this.notifications(false);
            callback();
            this.notifications(true);
          },
          startBatch: function() {
            var _p = this._private;
            if (_p.batchCount == null) {
              _p.batchCount = 0;
            }
            if (_p.batchCount === 0) {
              _p.batchingStyle = _p.batchingNotify = true;
              _p.batchStyleEles = this.collection();
              _p.batchNotifyEles = this.collection();
              _p.batchNotifyTypes = [];
              _p.batchNotifyTypes.ids = {};
            }
            _p.batchCount++;
            return this;
          },
          endBatch: function() {
            var _p = this._private;
            _p.batchCount--;
            if (_p.batchCount === 0) {
              _p.batchingStyle = false;
              _p.batchStyleEles.updateStyle();
              _p.batchingNotify = false;
              this.notify({
                type: _p.batchNotifyTypes,
                collection: _p.batchNotifyEles
              });
            }
            return this;
          },
          batch: function(callback) {
            this.startBatch();
            callback();
            this.endBatch();
            return this;
          },
          batchData: function(map) {
            var cy = this;
            return this.batch(function() {
              for (var id in map) {
                var data = map[id];
                var ele = cy.getElementById(id);
                ele.data(data);
              }
            });
          }
        });
        module.exports = corefn;
      }, {}],
      37: [function(_dereq_, module, exports) {
        'use strict';
        var util = _dereq_('../util');
        var corefn = ({
          renderTo: function(context, zoom, pan, pxRatio) {
            var r = this._private.renderer;
            r.renderTo(context, zoom, pan, pxRatio);
            return this;
          },
          renderer: function() {
            return this._private.renderer;
          },
          forceRender: function() {
            this.notify({type: 'draw'});
            return this;
          },
          resize: function() {
            this.notify({type: 'resize'});
            this.trigger('resize');
            return this;
          },
          initRenderer: function(options) {
            var cy = this;
            var RendererProto = cy.extension('renderer', options.name);
            if (RendererProto == null) {
              util.error('Can not initialise: No such renderer `%s` found; did you include its JS file?', options.name);
              return;
            }
            var rOpts = util.extend({}, options, {cy: cy});
            var renderer = cy._private.renderer = new RendererProto(rOpts);
            renderer.init(rOpts);
          },
          triggerOnRender: function() {
            var cbs = this._private.onRenders;
            for (var i = 0; i < cbs.length; i++) {
              var cb = cbs[i];
              cb();
            }
            return this;
          },
          onRender: function(cb) {
            this._private.onRenders.push(cb);
            return this;
          },
          offRender: function(fn) {
            var cbs = this._private.onRenders;
            if (fn == null) {
              this._private.onRenders = [];
              return this;
            }
            for (var i = 0; i < cbs.length; i++) {
              var cb = cbs[i];
              if (fn === cb) {
                cbs.splice(i, 1);
                break;
              }
            }
            return this;
          }
        });
        corefn.invalidateDimensions = corefn.resize;
        module.exports = corefn;
      }, {"../util": 94}],
      38: [function(_dereq_, module, exports) {
        'use strict';
        var is = _dereq_('../is');
        var Collection = _dereq_('../collection');
        var corefn = ({
          collection: function(eles, opts) {
            if (is.string(eles)) {
              return this.$(eles);
            } else if (is.elementOrCollection(eles)) {
              return eles.collection();
            } else if (is.array(eles)) {
              return Collection(this, eles, opts);
            }
            return Collection(this);
          },
          nodes: function(selector) {
            var nodes = this.$(function() {
              return this.isNode();
            });
            if (selector) {
              return nodes.filter(selector);
            }
            return nodes;
          },
          edges: function(selector) {
            var edges = this.$(function() {
              return this.isEdge();
            });
            if (selector) {
              return edges.filter(selector);
            }
            return edges;
          },
          $: function(selector) {
            var eles = new Collection(this, this._private.elements);
            if (selector) {
              return eles.filter(selector);
            }
            return eles;
          }
        });
        corefn.elements = corefn.filter = corefn.$;
        module.exports = corefn;
      }, {
        "../collection": 23,
        "../is": 77
      }],
      39: [function(_dereq_, module, exports) {
        'use strict';
        var is = _dereq_('../is');
        var Style = _dereq_('../style');
        var corefn = ({
          style: function(newStyle) {
            if (newStyle) {
              var s = this.setStyle(newStyle);
              s.update();
            }
            return this._private.style;
          },
          setStyle: function(style) {
            var _p = this._private;
            if (is.stylesheet(style)) {
              _p.style = style.generateStyle(this);
            } else if (is.array(style)) {
              _p.style = Style.fromJson(this, style);
            } else if (is.string(style)) {
              _p.style = Style.fromString(this, style);
            } else {
              _p.style = Style(this);
            }
            return _p.style;
          }
        });
        module.exports = corefn;
      }, {
        "../is": 77,
        "../style": 86
      }],
      40: [function(_dereq_, module, exports) {
        'use strict';
        var is = _dereq_('../is');
        var corefn = ({
          autolock: function(bool) {
            if (bool !== undefined) {
              this._private.autolock = bool ? true : false;
            } else {
              return this._private.autolock;
            }
            return this;
          },
          autoungrabify: function(bool) {
            if (bool !== undefined) {
              this._private.autoungrabify = bool ? true : false;
            } else {
              return this._private.autoungrabify;
            }
            return this;
          },
          autounselectify: function(bool) {
            if (bool !== undefined) {
              this._private.autounselectify = bool ? true : false;
            } else {
              return this._private.autounselectify;
            }
            return this;
          },
          panningEnabled: function(bool) {
            if (bool !== undefined) {
              this._private.panningEnabled = bool ? true : false;
            } else {
              return this._private.panningEnabled;
            }
            return this;
          },
          userPanningEnabled: function(bool) {
            if (bool !== undefined) {
              this._private.userPanningEnabled = bool ? true : false;
            } else {
              return this._private.userPanningEnabled;
            }
            return this;
          },
          zoomingEnabled: function(bool) {
            if (bool !== undefined) {
              this._private.zoomingEnabled = bool ? true : false;
            } else {
              return this._private.zoomingEnabled;
            }
            return this;
          },
          userZoomingEnabled: function(bool) {
            if (bool !== undefined) {
              this._private.userZoomingEnabled = bool ? true : false;
            } else {
              return this._private.userZoomingEnabled;
            }
            return this;
          },
          boxSelectionEnabled: function(bool) {
            if (bool !== undefined) {
              this._private.boxSelectionEnabled = bool ? true : false;
            } else {
              return this._private.boxSelectionEnabled;
            }
            return this;
          },
          pan: function() {
            var args = arguments;
            var pan = this._private.pan;
            var dim,
                val,
                dims,
                x,
                y;
            switch (args.length) {
              case 0:
                return pan;
              case 1:
                if (is.string(args[0])) {
                  dim = args[0];
                  return pan[dim];
                } else if (is.plainObject(args[0])) {
                  if (!this._private.panningEnabled) {
                    return this;
                  }
                  dims = args[0];
                  x = dims.x;
                  y = dims.y;
                  if (is.number(x)) {
                    pan.x = x;
                  }
                  if (is.number(y)) {
                    pan.y = y;
                  }
                  this.trigger('pan viewport');
                }
                break;
              case 2:
                if (!this._private.panningEnabled) {
                  return this;
                }
                dim = args[0];
                val = args[1];
                if ((dim === 'x' || dim === 'y') && is.number(val)) {
                  pan[dim] = val;
                }
                this.trigger('pan viewport');
                break;
              default:
                break;
            }
            this.notify({type: 'viewport'});
            return this;
          },
          panBy: function(params) {
            var args = arguments;
            var pan = this._private.pan;
            var dim,
                val,
                dims,
                x,
                y;
            if (!this._private.panningEnabled) {
              return this;
            }
            switch (args.length) {
              case 1:
                if (is.plainObject(args[0])) {
                  dims = args[0];
                  x = dims.x;
                  y = dims.y;
                  if (is.number(x)) {
                    pan.x += x;
                  }
                  if (is.number(y)) {
                    pan.y += y;
                  }
                  this.trigger('pan viewport');
                }
                break;
              case 2:
                dim = args[0];
                val = args[1];
                if ((dim === 'x' || dim === 'y') && is.number(val)) {
                  pan[dim] += val;
                }
                this.trigger('pan viewport');
                break;
              default:
                break;
            }
            this.notify({type: 'viewport'});
            return this;
          },
          fit: function(elements, padding) {
            var viewportState = this.getFitViewport(elements, padding);
            if (viewportState) {
              var _p = this._private;
              _p.zoom = viewportState.zoom;
              _p.pan = viewportState.pan;
              this.trigger('pan zoom viewport');
              this.notify({type: 'viewport'});
            }
            return this;
          },
          getFitViewport: function(elements, padding) {
            if (is.number(elements) && padding === undefined) {
              padding = elements;
              elements = undefined;
            }
            if (!this._private.panningEnabled || !this._private.zoomingEnabled) {
              return;
            }
            var bb;
            if (is.string(elements)) {
              var sel = elements;
              elements = this.$(sel);
            } else if (is.boundingBox(elements)) {
              var bbe = elements;
              bb = {
                x1: bbe.x1,
                y1: bbe.y1,
                x2: bbe.x2,
                y2: bbe.y2
              };
              bb.w = bb.x2 - bb.x1;
              bb.h = bb.y2 - bb.y1;
            } else if (!is.elementOrCollection(elements)) {
              elements = this.elements();
            }
            bb = bb || elements.boundingBox();
            var w = this.width();
            var h = this.height();
            var zoom;
            padding = is.number(padding) ? padding : 0;
            if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0 && !isNaN(bb.w) && !isNaN(bb.h) && bb.w > 0 && bb.h > 0) {
              zoom = Math.min((w - 2 * padding) / bb.w, (h - 2 * padding) / bb.h);
              zoom = zoom > this._private.maxZoom ? this._private.maxZoom : zoom;
              zoom = zoom < this._private.minZoom ? this._private.minZoom : zoom;
              var pan = {
                x: (w - zoom * (bb.x1 + bb.x2)) / 2,
                y: (h - zoom * (bb.y1 + bb.y2)) / 2
              };
              return {
                zoom: zoom,
                pan: pan
              };
            }
            return;
          },
          minZoom: function(zoom) {
            if (zoom === undefined) {
              return this._private.minZoom;
            } else if (is.number(zoom)) {
              this._private.minZoom = zoom;
            }
            return this;
          },
          maxZoom: function(zoom) {
            if (zoom === undefined) {
              return this._private.maxZoom;
            } else if (is.number(zoom)) {
              this._private.maxZoom = zoom;
            }
            return this;
          },
          zoom: function(params) {
            var pos;
            var zoom;
            if (params === undefined) {
              return this._private.zoom;
            } else if (is.number(params)) {
              zoom = params;
            } else if (is.plainObject(params)) {
              zoom = params.level;
              if (params.position) {
                var p = params.position;
                var pan = this._private.pan;
                var z = this._private.zoom;
                pos = {
                  x: p.x * z + pan.x,
                  y: p.y * z + pan.y
                };
              } else if (params.renderedPosition) {
                pos = params.renderedPosition;
              }
              if (pos && !this._private.panningEnabled) {
                return this;
              }
            }
            if (!this._private.zoomingEnabled) {
              return this;
            }
            if (!is.number(zoom) || (pos && (!is.number(pos.x) || !is.number(pos.y)))) {
              return this;
            }
            zoom = zoom > this._private.maxZoom ? this._private.maxZoom : zoom;
            zoom = zoom < this._private.minZoom ? this._private.minZoom : zoom;
            if (pos) {
              var pan1 = this._private.pan;
              var zoom1 = this._private.zoom;
              var zoom2 = zoom;
              var pan2 = {
                x: -zoom2 / zoom1 * (pos.x - pan1.x) + pos.x,
                y: -zoom2 / zoom1 * (pos.y - pan1.y) + pos.y
              };
              this._private.zoom = zoom;
              this._private.pan = pan2;
              var posChanged = pan1.x !== pan2.x || pan1.y !== pan2.y;
              this.trigger(' zoom ' + (posChanged ? ' pan ' : '') + ' viewport ');
            } else {
              this._private.zoom = zoom;
              this.trigger('zoom viewport');
            }
            this.notify({type: 'viewport'});
            return this;
          },
          viewport: function(opts) {
            var _p = this._private;
            var zoomDefd = true;
            var panDefd = true;
            var events = [];
            var zoomFailed = false;
            var panFailed = false;
            if (!opts) {
              return this;
            }
            if (!is.number(opts.zoom)) {
              zoomDefd = false;
            }
            if (!is.plainObject(opts.pan)) {
              panDefd = false;
            }
            if (!zoomDefd && !panDefd) {
              return this;
            }
            if (zoomDefd) {
              var z = opts.zoom;
              if (z < _p.minZoom || z > _p.maxZoom || !_p.zoomingEnabled) {
                zoomFailed = true;
              } else {
                _p.zoom = z;
                events.push('zoom');
              }
            }
            if (panDefd && (!zoomFailed || !opts.cancelOnFailedZoom) && _p.panningEnabled) {
              var p = opts.pan;
              if (is.number(p.x)) {
                _p.pan.x = p.x;
                panFailed = false;
              }
              if (is.number(p.y)) {
                _p.pan.y = p.y;
                panFailed = false;
              }
              if (!panFailed) {
                events.push('pan');
              }
            }
            if (events.length > 0) {
              events.push('viewport');
              this.trigger(events.join(' '));
              this.notify({type: 'viewport'});
            }
            return this;
          },
          center: function(elements) {
            var pan = this.getCenterPan(elements);
            if (pan) {
              this._private.pan = pan;
              this.trigger('pan viewport');
              this.notify({type: 'viewport'});
            }
            return this;
          },
          getCenterPan: function(elements, zoom) {
            if (!this._private.panningEnabled) {
              return;
            }
            if (is.string(elements)) {
              var selector = elements;
              elements = this.elements(selector);
            } else if (!is.elementOrCollection(elements)) {
              elements = this.elements();
            }
            var bb = elements.boundingBox();
            var w = this.width();
            var h = this.height();
            zoom = zoom === undefined ? this._private.zoom : zoom;
            var pan = {
              x: (w - zoom * (bb.x1 + bb.x2)) / 2,
              y: (h - zoom * (bb.y1 + bb.y2)) / 2
            };
            return pan;
          },
          reset: function() {
            if (!this._private.panningEnabled || !this._private.zoomingEnabled) {
              return this;
            }
            this.viewport({
              pan: {
                x: 0,
                y: 0
              },
              zoom: 1
            });
            return this;
          },
          width: function() {
            var container = this._private.container;
            if (container) {
              return container.clientWidth;
            }
            return 1;
          },
          height: function() {
            var container = this._private.container;
            if (container) {
              return container.clientHeight;
            }
            return 1;
          },
          extent: function() {
            var pan = this._private.pan;
            var zoom = this._private.zoom;
            var rb = this.renderedExtent();
            var b = {
              x1: (rb.x1 - pan.x) / zoom,
              x2: (rb.x2 - pan.x) / zoom,
              y1: (rb.y1 - pan.y) / zoom,
              y2: (rb.y2 - pan.y) / zoom
            };
            b.w = b.x2 - b.x1;
            b.h = b.y2 - b.y1;
            return b;
          },
          renderedExtent: function() {
            var width = this.width();
            var height = this.height();
            return {
              x1: 0,
              y1: 0,
              x2: width,
              y2: height,
              w: width,
              h: height
            };
          }
        });
        corefn.centre = corefn.center;
        corefn.autolockNodes = corefn.autolock;
        corefn.autoungrabifyNodes = corefn.autoungrabify;
        module.exports = corefn;
      }, {"../is": 77}],
      41: [function(_dereq_, module, exports) {
        'use strict';
        var util = _dereq_('./util');
        var is = _dereq_('./is');
        var Selector = _dereq_('./selector');
        var Promise = _dereq_('./promise');
        var Event = _dereq_('./event');
        var Animation = _dereq_('./animation');
        var define = {
          data: function(params) {
            var defaults = {
              field: 'data',
              bindingEvent: 'data',
              allowBinding: false,
              allowSetting: false,
              allowGetting: false,
              settingEvent: 'data',
              settingTriggersEvent: false,
              triggerFnName: 'trigger',
              immutableKeys: {},
              updateStyle: false,
              onSet: function(self) {},
              canSet: function(self) {
                return true;
              }
            };
            params = util.extend({}, defaults, params);
            return function dataImpl(name, value) {
              var p = params;
              var self = this;
              var selfIsArrayLike = self.length !== undefined;
              var all = selfIsArrayLike ? self : [self];
              var single = selfIsArrayLike ? self[0] : self;
              if (is.string(name)) {
                if (p.allowGetting && value === undefined) {
                  var ret;
                  if (single) {
                    ret = single._private[p.field][name];
                  }
                  return ret;
                } else if (p.allowSetting && value !== undefined) {
                  var valid = !p.immutableKeys[name];
                  if (valid) {
                    for (var i = 0,
                        l = all.length; i < l; i++) {
                      if (p.canSet(all[i])) {
                        all[i]._private[p.field][name] = value;
                      }
                    }
                    if (p.updateStyle) {
                      self.updateStyle();
                    }
                    p.onSet(self);
                    if (p.settingTriggersEvent) {
                      self[p.triggerFnName](p.settingEvent);
                    }
                  }
                }
              } else if (p.allowSetting && is.plainObject(name)) {
                var obj = name;
                var k,
                    v;
                for (k in obj) {
                  v = obj[k];
                  var valid = !p.immutableKeys[k];
                  if (valid) {
                    for (var i = 0,
                        l = all.length; i < l; i++) {
                      if (p.canSet(all[i])) {
                        all[i]._private[p.field][k] = v;
                      }
                    }
                  }
                }
                if (p.updateStyle) {
                  self.updateStyle();
                }
                p.onSet(self);
                if (p.settingTriggersEvent) {
                  self[p.triggerFnName](p.settingEvent);
                }
              } else if (p.allowBinding && is.fn(name)) {
                var fn = name;
                self.bind(p.bindingEvent, fn);
              } else if (p.allowGetting && name === undefined) {
                var ret;
                if (single) {
                  ret = single._private[p.field];
                }
                return ret;
              }
              return self;
            };
          },
          removeData: function(params) {
            var defaults = {
              field: 'data',
              event: 'data',
              triggerFnName: 'trigger',
              triggerEvent: false,
              immutableKeys: {}
            };
            params = util.extend({}, defaults, params);
            return function removeDataImpl(names) {
              var p = params;
              var self = this;
              var selfIsArrayLike = self.length !== undefined;
              var all = selfIsArrayLike ? self : [self];
              if (is.string(names)) {
                var keys = names.split(/\s+/);
                var l = keys.length;
                for (var i = 0; i < l; i++) {
                  var key = keys[i];
                  if (is.emptyString(key)) {
                    continue;
                  }
                  var valid = !p.immutableKeys[key];
                  if (valid) {
                    for (var i_a = 0,
                        l_a = all.length; i_a < l_a; i_a++) {
                      all[i_a]._private[p.field][key] = undefined;
                    }
                  }
                }
                if (p.triggerEvent) {
                  self[p.triggerFnName](p.event);
                }
              } else if (names === undefined) {
                for (var i_a = 0,
                    l_a = all.length; i_a < l_a; i_a++) {
                  var _privateFields = all[i_a]._private[p.field];
                  for (var key in _privateFields) {
                    var validKeyToDelete = !p.immutableKeys[key];
                    if (validKeyToDelete) {
                      _privateFields[key] = undefined;
                    }
                  }
                }
                if (p.triggerEvent) {
                  self[p.triggerFnName](p.event);
                }
              }
              return self;
            };
          },
          event: {
            regex: /(\w+)(\.\w+)?/,
            optionalTypeRegex: /(\w+)?(\.\w+)?/,
            falseCallback: function() {
              return false;
            }
          },
          on: function(params) {
            var defaults = {
              unbindSelfOnTrigger: false,
              unbindAllBindersOnTrigger: false
            };
            params = util.extend({}, defaults, params);
            return function onImpl(events, selector, data, callback) {
              var self = this;
              var selfIsArrayLike = self.length !== undefined;
              var all = selfIsArrayLike ? self : [self];
              var eventsIsString = is.string(events);
              var p = params;
              if (is.plainObject(selector)) {
                callback = data;
                data = selector;
                selector = undefined;
              } else if (is.fn(selector) || selector === false) {
                callback = selector;
                data = undefined;
                selector = undefined;
              }
              if (is.fn(data) || data === false) {
                callback = data;
                data = undefined;
              }
              if (!(is.fn(callback) || callback === false) && eventsIsString) {
                return self;
              }
              if (eventsIsString) {
                var map = {};
                map[events] = callback;
                events = map;
              }
              for (var evts in events) {
                callback = events[evts];
                if (callback === false) {
                  callback = define.event.falseCallback;
                }
                if (!is.fn(callback)) {
                  continue;
                }
                evts = evts.split(/\s+/);
                for (var i = 0; i < evts.length; i++) {
                  var evt = evts[i];
                  if (is.emptyString(evt)) {
                    continue;
                  }
                  var match = evt.match(define.event.regex);
                  if (match) {
                    var type = match[1];
                    var namespace = match[2] ? match[2] : undefined;
                    var listener = {
                      callback: callback,
                      data: data,
                      delegated: selector ? true : false,
                      selector: selector,
                      selObj: new Selector(selector),
                      type: type,
                      namespace: namespace,
                      unbindSelfOnTrigger: p.unbindSelfOnTrigger,
                      unbindAllBindersOnTrigger: p.unbindAllBindersOnTrigger,
                      binders: all
                    };
                    for (var j = 0; j < all.length; j++) {
                      var _p = all[j]._private;
                      _p.listeners = _p.listeners || [];
                      _p.listeners.push(listener);
                    }
                  }
                }
              }
              return self;
            };
          },
          eventAliasesOn: function(proto) {
            var p = proto;
            p.addListener = p.listen = p.bind = p.on;
            p.removeListener = p.unlisten = p.unbind = p.off;
            p.emit = p.trigger;
            p.pon = p.promiseOn = function(events, selector) {
              var self = this;
              var args = Array.prototype.slice.call(arguments, 0);
              return new Promise(function(resolve, reject) {
                var callback = function(e) {
                  self.off.apply(self, offArgs);
                  resolve(e);
                };
                var onArgs = args.concat([callback]);
                var offArgs = onArgs.concat([]);
                self.on.apply(self, onArgs);
              });
            };
          },
          off: function offImpl(params) {
            var defaults = {};
            params = util.extend({}, defaults, params);
            return function(events, selector, callback) {
              var self = this;
              var selfIsArrayLike = self.length !== undefined;
              var all = selfIsArrayLike ? self : [self];
              var eventsIsString = is.string(events);
              if (arguments.length === 0) {
                for (var i = 0; i < all.length; i++) {
                  all[i]._private.listeners = [];
                }
                return self;
              }
              if (is.fn(selector) || selector === false) {
                callback = selector;
                selector = undefined;
              }
              if (eventsIsString) {
                var map = {};
                map[events] = callback;
                events = map;
              }
              for (var evts in events) {
                callback = events[evts];
                if (callback === false) {
                  callback = define.event.falseCallback;
                }
                evts = evts.split(/\s+/);
                for (var h = 0; h < evts.length; h++) {
                  var evt = evts[h];
                  if (is.emptyString(evt)) {
                    continue;
                  }
                  var match = evt.match(define.event.optionalTypeRegex);
                  if (match) {
                    var type = match[1] ? match[1] : undefined;
                    var namespace = match[2] ? match[2] : undefined;
                    for (var i = 0; i < all.length; i++) {
                      var listeners = all[i]._private.listeners = all[i]._private.listeners || [];
                      for (var j = 0; j < listeners.length; j++) {
                        var listener = listeners[j];
                        var nsMatches = !namespace || namespace === listener.namespace;
                        var typeMatches = !type || listener.type === type;
                        var cbMatches = !callback || callback === listener.callback;
                        var listenerMatches = nsMatches && typeMatches && cbMatches;
                        if (listenerMatches) {
                          listeners.splice(j, 1);
                          j--;
                        }
                      }
                    }
                  }
                }
              }
              return self;
            };
          },
          trigger: function(params) {
            var defaults = {};
            params = util.extend({}, defaults, params);
            return function triggerImpl(events, extraParams, fnToTrigger) {
              var self = this;
              var selfIsArrayLike = self.length !== undefined;
              var all = selfIsArrayLike ? self : [self];
              var eventsIsString = is.string(events);
              var eventsIsObject = is.plainObject(events);
              var eventsIsEvent = is.event(events);
              var cy = this._private.cy || (is.core(this) ? this : null);
              var hasCompounds = cy ? cy.hasCompoundNodes() : false;
              if (eventsIsString) {
                var evts = events.split(/\s+/);
                events = [];
                for (var i = 0; i < evts.length; i++) {
                  var evt = evts[i];
                  if (is.emptyString(evt)) {
                    continue;
                  }
                  var match = evt.match(define.event.regex);
                  var type = match[1];
                  var namespace = match[2] ? match[2] : undefined;
                  events.push({
                    type: type,
                    namespace: namespace
                  });
                }
              } else if (eventsIsObject) {
                var eventArgObj = events;
                events = [eventArgObj];
              }
              if (extraParams) {
                if (!is.array(extraParams)) {
                  extraParams = [extraParams];
                }
              } else {
                extraParams = [];
              }
              for (var i = 0; i < events.length; i++) {
                var evtObj = events[i];
                for (var j = 0; j < all.length; j++) {
                  var triggerer = all[j];
                  var listeners = triggerer._private.listeners = triggerer._private.listeners || [];
                  var triggererIsElement = is.element(triggerer);
                  var bubbleUp = triggererIsElement || params.layout;
                  var evt;
                  if (eventsIsEvent) {
                    evt = evtObj;
                    evt.cyTarget = evt.cyTarget || triggerer;
                    evt.cy = evt.cy || cy;
                  } else {
                    evt = new Event(evtObj, {
                      cyTarget: triggerer,
                      cy: cy,
                      namespace: evtObj.namespace
                    });
                  }
                  if (evtObj.layout) {
                    evt.layout = evtObj.layout;
                  }
                  if (params.layout) {
                    evt.layout = triggerer;
                  }
                  if (evt.cyPosition) {
                    var pos = evt.cyPosition;
                    var zoom = cy.zoom();
                    var pan = cy.pan();
                    evt.cyRenderedPosition = {
                      x: pos.x * zoom + pan.x,
                      y: pos.y * zoom + pan.y
                    };
                  }
                  if (fnToTrigger) {
                    listeners = [{
                      namespace: evt.namespace,
                      type: evt.type,
                      callback: fnToTrigger
                    }];
                  }
                  for (var k = 0; k < listeners.length; k++) {
                    var lis = listeners[k];
                    var nsMatches = !lis.namespace || lis.namespace === evt.namespace;
                    var typeMatches = lis.type === evt.type;
                    var targetMatches = lis.delegated ? (triggerer !== evt.cyTarget && is.element(evt.cyTarget) && lis.selObj.matches(evt.cyTarget)) : (true);
                    var listenerMatches = nsMatches && typeMatches && targetMatches;
                    if (listenerMatches) {
                      var args = [evt];
                      args = args.concat(extraParams);
                      if (lis.data) {
                        evt.data = lis.data;
                      } else {
                        evt.data = undefined;
                      }
                      if (lis.unbindSelfOnTrigger || lis.unbindAllBindersOnTrigger) {
                        listeners.splice(k, 1);
                        k--;
                      }
                      if (lis.unbindAllBindersOnTrigger) {
                        var binders = lis.binders;
                        for (var l = 0; l < binders.length; l++) {
                          var binder = binders[l];
                          if (!binder || binder === triggerer) {
                            continue;
                          }
                          var binderListeners = binder._private.listeners;
                          for (var m = 0; m < binderListeners.length; m++) {
                            var binderListener = binderListeners[m];
                            if (binderListener === lis) {
                              binderListeners.splice(m, 1);
                              m--;
                            }
                          }
                        }
                      }
                      var context = lis.delegated ? evt.cyTarget : triggerer;
                      var ret = lis.callback.apply(context, args);
                      if (ret === false || evt.isPropagationStopped()) {
                        bubbleUp = false;
                        if (ret === false) {
                          evt.stopPropagation();
                          evt.preventDefault();
                        }
                      }
                    }
                  }
                  if (bubbleUp) {
                    var parent = hasCompounds ? triggerer._private.parent : null;
                    var hasParent = parent != null && parent.length !== 0;
                    if (hasParent) {
                      parent = parent[0];
                      parent.trigger(evt);
                    } else {
                      cy.trigger(evt);
                    }
                  }
                }
              }
              return self;
            };
          },
          animated: function(fnParams) {
            var defaults = {};
            fnParams = util.extend({}, defaults, fnParams);
            return function animatedImpl() {
              var self = this;
              var selfIsArrayLike = self.length !== undefined;
              var all = selfIsArrayLike ? self : [self];
              var cy = this._private.cy || this;
              if (!cy.styleEnabled()) {
                return false;
              }
              var ele = all[0];
              if (ele) {
                return ele._private.animation.current.length > 0;
              }
            };
          },
          clearQueue: function(fnParams) {
            var defaults = {};
            fnParams = util.extend({}, defaults, fnParams);
            return function clearQueueImpl() {
              var self = this;
              var selfIsArrayLike = self.length !== undefined;
              var all = selfIsArrayLike ? self : [self];
              var cy = this._private.cy || this;
              if (!cy.styleEnabled()) {
                return this;
              }
              for (var i = 0; i < all.length; i++) {
                var ele = all[i];
                ele._private.animation.queue = [];
              }
              return this;
            };
          },
          delay: function(fnParams) {
            var defaults = {};
            fnParams = util.extend({}, defaults, fnParams);
            return function delayImpl(time, complete) {
              var cy = this._private.cy || this;
              if (!cy.styleEnabled()) {
                return this;
              }
              return this.animate({
                delay: time,
                duration: time,
                complete: complete
              });
            };
          },
          delayAnimation: function(fnParams) {
            var defaults = {};
            fnParams = util.extend({}, defaults, fnParams);
            return function delayAnimationImpl(time, complete) {
              var cy = this._private.cy || this;
              if (!cy.styleEnabled()) {
                return this;
              }
              return this.animation({
                delay: time,
                duration: time,
                complete: complete
              });
            };
          },
          animation: function(fnParams) {
            var defaults = {};
            fnParams = util.extend({}, defaults, fnParams);
            return function animationImpl(properties, params) {
              var self = this;
              var selfIsArrayLike = self.length !== undefined;
              var all = selfIsArrayLike ? self : [self];
              var cy = this._private.cy || this;
              var isCore = !selfIsArrayLike;
              var isEles = !isCore;
              if (!cy.styleEnabled()) {
                return this;
              }
              var style = cy.style();
              properties = util.extend({}, properties, params);
              if (properties.duration === undefined) {
                properties.duration = 400;
              }
              switch (properties.duration) {
                case 'slow':
                  properties.duration = 600;
                  break;
                case 'fast':
                  properties.duration = 200;
                  break;
              }
              var propertiesEmpty = true;
              if (properties) {
                for (var i in properties) {
                  propertiesEmpty = false;
                  break;
                }
              }
              if (propertiesEmpty) {
                return new Animation(all[0], properties);
              }
              if (isEles) {
                properties.style = style.getPropsList(properties.style || properties.css);
                properties.css = undefined;
              }
              if (properties.renderedPosition && isEles) {
                var rpos = properties.renderedPosition;
                var pan = cy.pan();
                var zoom = cy.zoom();
                properties.position = {
                  x: (rpos.x - pan.x) / zoom,
                  y: (rpos.y - pan.y) / zoom
                };
              }
              if (properties.panBy && isCore) {
                var panBy = properties.panBy;
                var cyPan = cy.pan();
                properties.pan = {
                  x: cyPan.x + panBy.x,
                  y: cyPan.y + panBy.y
                };
              }
              var center = properties.center || properties.centre;
              if (center && isCore) {
                var centerPan = cy.getCenterPan(center.eles, properties.zoom);
                if (centerPan) {
                  properties.pan = centerPan;
                }
              }
              if (properties.fit && isCore) {
                var fit = properties.fit;
                var fitVp = cy.getFitViewport(fit.eles || fit.boundingBox, fit.padding);
                if (fitVp) {
                  properties.pan = fitVp.pan;
                  properties.zoom = fitVp.zoom;
                }
              }
              return new Animation(all[0], properties);
            };
          },
          animate: function(fnParams) {
            var defaults = {};
            fnParams = util.extend({}, defaults, fnParams);
            return function animateImpl(properties, params) {
              var self = this;
              var selfIsArrayLike = self.length !== undefined;
              var all = selfIsArrayLike ? self : [self];
              var cy = this._private.cy || this;
              if (!cy.styleEnabled()) {
                return this;
              }
              if (params) {
                properties = util.extend({}, properties, params);
              }
              for (var i = 0; i < all.length; i++) {
                var ele = all[i];
                var queue = ele.animated() && (properties.queue === undefined || properties.queue);
                var ani = ele.animation(properties, (queue ? {queue: true} : undefined));
                ani.play();
              }
              return this;
            };
          },
          stop: function(fnParams) {
            var defaults = {};
            fnParams = util.extend({}, defaults, fnParams);
            return function stopImpl(clearQueue, jumpToEnd) {
              var self = this;
              var selfIsArrayLike = self.length !== undefined;
              var all = selfIsArrayLike ? self : [self];
              var cy = this._private.cy || this;
              if (!cy.styleEnabled()) {
                return this;
              }
              for (var i = 0; i < all.length; i++) {
                var ele = all[i];
                var _p = ele._private;
                var anis = _p.animation.current;
                for (var j = 0; j < anis.length; j++) {
                  var ani = anis[j];
                  var ani_p = ani._private;
                  if (jumpToEnd) {
                    ani_p.duration = 0;
                  }
                }
                if (clearQueue) {
                  _p.animation.queue = [];
                }
                if (!jumpToEnd) {
                  _p.animation.current = [];
                }
              }
              cy.notify({
                collection: this,
                type: 'draw'
              });
              return this;
            };
          }
        };
        module.exports = define;
      }, {
        "./animation": 1,
        "./event": 42,
        "./is": 77,
        "./promise": 80,
        "./selector": 81,
        "./util": 94
      }],
      42: [function(_dereq_, module, exports) {
        'use strict';
        var Event = function(src, props) {
          if (!(this instanceof Event)) {
            return new Event(src, props);
          }
          if (src && src.type) {
            this.originalEvent = src;
            this.type = src.type;
            this.isDefaultPrevented = (src.defaultPrevented) ? returnTrue : returnFalse;
          } else {
            this.type = src;
          }
          if (props) {
            this.type = props.type !== undefined ? props.type : this.type;
            this.cy = props.cy;
            this.cyTarget = props.cyTarget;
            this.cyPosition = props.cyPosition;
            this.cyRenderedPosition = props.cyRenderedPosition;
            this.namespace = props.namespace;
            this.layout = props.layout;
            this.data = props.data;
            this.message = props.message;
          }
          this.timeStamp = src && src.timeStamp || Date.now();
        };
        function returnFalse() {
          return false;
        }
        function returnTrue() {
          return true;
        }
        Event.prototype = {
          instanceString: function() {
            return 'event';
          },
          preventDefault: function() {
            this.isDefaultPrevented = returnTrue;
            var e = this.originalEvent;
            if (!e) {
              return;
            }
            if (e.preventDefault) {
              e.preventDefault();
            }
          },
          stopPropagation: function() {
            this.isPropagationStopped = returnTrue;
            var e = this.originalEvent;
            if (!e) {
              return;
            }
            if (e.stopPropagation) {
              e.stopPropagation();
            }
          },
          stopImmediatePropagation: function() {
            this.isImmediatePropagationStopped = returnTrue;
            this.stopPropagation();
          },
          isDefaultPrevented: returnFalse,
          isPropagationStopped: returnFalse,
          isImmediatePropagationStopped: returnFalse
        };
        module.exports = Event;
      }, {}],
      43: [function(_dereq_, module, exports) {
        'use strict';
        var util = _dereq_('./util');
        var define = _dereq_('./define');
        var Collection = _dereq_('./collection');
        var Core = _dereq_('./core');
        var incExts = _dereq_('./extensions');
        var is = _dereq_('./is');
        var extensions = {};
        var modules = {};
        function setExtension(type, name, registrant) {
          var ext = registrant;
          if (type === 'core') {
            Core.prototype[name] = registrant;
          } else if (type === 'collection') {
            Collection.prototype[name] = registrant;
          } else if (type === 'layout') {
            var Layout = function(options) {
              this.options = options;
              registrant.call(this, options);
              if (!is.plainObject(this._private)) {
                this._private = {};
              }
              this._private.cy = options.cy;
              this._private.listeners = [];
            };
            var layoutProto = Layout.prototype = Object.create(registrant.prototype);
            var optLayoutFns = [];
            for (var i = 0; i < optLayoutFns.length; i++) {
              var fnName = optLayoutFns[i];
              layoutProto[fnName] = layoutProto[fnName] || function() {
                return this;
              };
            }
            if (layoutProto.start && !layoutProto.run) {
              layoutProto.run = function() {
                this.start();
                return this;
              };
            } else if (!layoutProto.start && layoutProto.run) {
              layoutProto.start = function() {
                this.run();
                return this;
              };
            }
            if (!layoutProto.stop) {
              layoutProto.stop = function() {
                var opts = this.options;
                if (opts && opts.animate) {
                  var anis = this.animations;
                  for (var i = 0; i < anis.length; i++) {
                    anis[i].stop();
                  }
                }
                this.trigger('layoutstop');
                return this;
              };
            }
            if (!layoutProto.destroy) {
              layoutProto.destroy = function() {
                return this;
              };
            }
            layoutProto.on = define.on({layout: true});
            layoutProto.one = define.on({
              layout: true,
              unbindSelfOnTrigger: true
            });
            layoutProto.once = define.on({
              layout: true,
              unbindAllBindersOnTrigger: true
            });
            layoutProto.off = define.off({layout: true});
            layoutProto.trigger = define.trigger({layout: true});
            define.eventAliasesOn(layoutProto);
            ext = Layout;
          } else if (type === 'renderer' && name !== 'null' && name !== 'base') {
            var bProto = getExtension('renderer', 'base').prototype;
            var rProto = registrant.prototype;
            for (var pName in bProto) {
              var pVal = bProto[pName];
              var existsInR = rProto[pName] != null;
              if (existsInR) {
                util.error('Can not register renderer `' + name + '` since it overrides `' + pName + '` in its prototype');
                return;
              }
              rProto[pName] = pVal;
            }
            bProto.clientFunctions.forEach(function(name) {
              rProto[name] = rProto[name] || function() {
                util.error('Renderer does not implement `renderer.' + name + '()` on its prototype');
              };
            });
          }
          return util.setMap({
            map: extensions,
            keys: [type, name],
            value: ext
          });
        }
        function getExtension(type, name) {
          return util.getMap({
            map: extensions,
            keys: [type, name]
          });
        }
        function setModule(type, name, moduleType, moduleName, registrant) {
          return util.setMap({
            map: modules,
            keys: [type, name, moduleType, moduleName],
            value: registrant
          });
        }
        function getModule(type, name, moduleType, moduleName) {
          return util.getMap({
            map: modules,
            keys: [type, name, moduleType, moduleName]
          });
        }
        var extension = function() {
          if (arguments.length === 2) {
            return getExtension.apply(null, arguments);
          } else if (arguments.length === 3) {
            return setExtension.apply(null, arguments);
          } else if (arguments.length === 4) {
            return getModule.apply(null, arguments);
          } else if (arguments.length === 5) {
            return setModule.apply(null, arguments);
          } else {
            util.error('Invalid extension access syntax');
          }
        };
        Core.prototype.extension = extension;
        incExts.forEach(function(group) {
          group.extensions.forEach(function(ext) {
            setExtension(group.type, ext.name, ext.impl);
          });
        });
        module.exports = extension;
      }, {
        "./collection": 23,
        "./core": 34,
        "./define": 41,
        "./extensions": 44,
        "./is": 77,
        "./util": 94
      }],
      44: [function(_dereq_, module, exports) {
        'use strict';
        module.exports = [{
          type: 'layout',
          extensions: _dereq_('./layout')
        }, {
          type: 'renderer',
          extensions: _dereq_('./renderer')
        }];
      }, {
        "./layout": 50,
        "./renderer": 72
      }],
      45: [function(_dereq_, module, exports) {
        'use strict';
        var util = _dereq_('../../util');
        var math = _dereq_('../../math');
        var is = _dereq_('../../is');
        var defaults = {
          fit: true,
          directed: false,
          padding: 30,
          circle: false,
          spacingFactor: 1.75,
          boundingBox: undefined,
          avoidOverlap: true,
          roots: undefined,
          maximalAdjustments: 0,
          animate: false,
          animationDuration: 500,
          animationEasing: undefined,
          ready: undefined,
          stop: undefined
        };
        function BreadthFirstLayout(options) {
          this.options = util.extend({}, defaults, options);
        }
        BreadthFirstLayout.prototype.run = function() {
          var params = this.options;
          var options = params;
          var cy = params.cy;
          var eles = options.eles;
          var nodes = eles.nodes().not(':parent');
          var graph = eles;
          var bb = math.makeBoundingBox(options.boundingBox ? options.boundingBox : {
            x1: 0,
            y1: 0,
            w: cy.width(),
            h: cy.height()
          });
          var roots;
          if (is.elementOrCollection(options.roots)) {
            roots = options.roots;
          } else if (is.array(options.roots)) {
            var rootsArray = [];
            for (var i = 0; i < options.roots.length; i++) {
              var id = options.roots[i];
              var ele = cy.getElementById(id);
              rootsArray.push(ele);
            }
            roots = cy.collection(rootsArray);
          } else if (is.string(options.roots)) {
            roots = cy.$(options.roots);
          } else {
            if (options.directed) {
              roots = nodes.roots();
            } else {
              var components = [];
              var unhandledNodes = nodes;
              while (unhandledNodes.length > 0) {
                var currComp = cy.collection();
                eles.bfs({
                  roots: unhandledNodes[0],
                  visit: function(i, depth, node, edge, pNode) {
                    currComp = currComp.add(node);
                  },
                  directed: false
                });
                unhandledNodes = unhandledNodes.not(currComp);
                components.push(currComp);
              }
              roots = cy.collection();
              for (var i = 0; i < components.length; i++) {
                var comp = components[i];
                var maxDegree = comp.maxDegree(false);
                var compRoots = comp.filter(function() {
                  return this.degree(false) === maxDegree;
                });
                roots = roots.add(compRoots);
              }
            }
          }
          var depths = [];
          var foundByBfs = {};
          var id2depth = {};
          var prevNode = {};
          var prevEdge = {};
          var successors = {};
          graph.bfs({
            roots: roots,
            directed: options.directed,
            visit: function(i, depth, node, edge, pNode) {
              var ele = this[0];
              var id = ele.id();
              if (!depths[depth]) {
                depths[depth] = [];
              }
              depths[depth].push(ele);
              foundByBfs[id] = true;
              id2depth[id] = depth;
              prevNode[id] = pNode;
              prevEdge[id] = edge;
              if (pNode) {
                var prevId = pNode.id();
                var succ = successors[prevId] = successors[prevId] || [];
                succ.push(node);
              }
            }
          });
          var orphanNodes = [];
          for (var i = 0; i < nodes.length; i++) {
            var ele = nodes[i];
            if (foundByBfs[ele.id()]) {
              continue;
            } else {
              orphanNodes.push(ele);
            }
          }
          var maxChecks = orphanNodes.length * 3;
          var checks = 0;
          while (orphanNodes.length !== 0 && checks < maxChecks) {
            var node = orphanNodes.shift();
            var neighbors = node.neighborhood().nodes();
            var assignedDepth = false;
            for (var i = 0; i < neighbors.length; i++) {
              var depth = id2depth[neighbors[i].id()];
              if (depth !== undefined) {
                depths[depth].push(node);
                assignedDepth = true;
                break;
              }
            }
            if (!assignedDepth) {
              orphanNodes.push(node);
            }
            checks++;
          }
          while (orphanNodes.length !== 0) {
            var node = orphanNodes.shift();
            var assignedDepth = false;
            if (!assignedDepth) {
              if (depths.length === 0) {
                depths.push([]);
              }
              depths[0].push(node);
            }
          }
          var assignDepthsToEles = function() {
            for (var i = 0; i < depths.length; i++) {
              var eles = depths[i];
              for (var j = 0; j < eles.length; j++) {
                var ele = eles[j];
                ele._private.scratch.breadthfirst = {
                  depth: i,
                  index: j
                };
              }
            }
          };
          assignDepthsToEles();
          var intersectsDepth = function(node) {
            var edges = node.connectedEdges(function() {
              return this.data('target') === node.id();
            });
            var thisInfo = node._private.scratch.breadthfirst;
            var highestDepthOfOther = 0;
            var highestOther;
            for (var i = 0; i < edges.length; i++) {
              var edge = edges[i];
              var otherNode = edge.source()[0];
              var otherInfo = otherNode._private.scratch.breadthfirst;
              if (thisInfo.depth <= otherInfo.depth && highestDepthOfOther < otherInfo.depth) {
                highestDepthOfOther = otherInfo.depth;
                highestOther = otherNode;
              }
            }
            return highestOther;
          };
          for (var adj = 0; adj < options.maximalAdjustments; adj++) {
            var nDepths = depths.length;
            var elesToMove = [];
            for (var i = 0; i < nDepths; i++) {
              var depth = depths[i];
              var nDepth = depth.length;
              for (var j = 0; j < nDepth; j++) {
                var ele = depth[j];
                var info = ele._private.scratch.breadthfirst;
                var intEle = intersectsDepth(ele);
                if (intEle) {
                  info.intEle = intEle;
                  elesToMove.push(ele);
                }
              }
            }
            for (var i = 0; i < elesToMove.length; i++) {
              var ele = elesToMove[i];
              var info = ele._private.scratch.breadthfirst;
              var intEle = info.intEle;
              var intInfo = intEle._private.scratch.breadthfirst;
              depths[info.depth].splice(info.index, 1);
              var newDepth = intInfo.depth + 1;
              while (newDepth > depths.length - 1) {
                depths.push([]);
              }
              depths[newDepth].push(ele);
              info.depth = newDepth;
              info.index = depths[newDepth].length - 1;
            }
            assignDepthsToEles();
          }
          var minDistance = 0;
          if (options.avoidOverlap) {
            for (var i = 0; i < nodes.length; i++) {
              var n = nodes[i];
              var nbb = n.boundingBox();
              var w = nbb.w;
              var h = nbb.h;
              minDistance = Math.max(minDistance, w, h);
            }
            minDistance *= options.spacingFactor;
          }
          var cachedWeightedPercent = {};
          var getWeightedPercent = function(ele) {
            if (cachedWeightedPercent[ele.id()]) {
              return cachedWeightedPercent[ele.id()];
            }
            var eleDepth = ele._private.scratch.breadthfirst.depth;
            var neighbors = ele.neighborhood().nodes().not(':parent');
            var percent = 0;
            var samples = 0;
            for (var i = 0; i < neighbors.length; i++) {
              var neighbor = neighbors[i];
              var bf = neighbor._private.scratch.breadthfirst;
              var index = bf.index;
              var depth = bf.depth;
              var nDepth = depths[depth].length;
              if (eleDepth > depth || eleDepth === 0) {
                percent += index / nDepth;
                samples++;
              }
            }
            samples = Math.max(1, samples);
            percent = percent / samples;
            if (samples === 0) {
              percent = undefined;
            }
            cachedWeightedPercent[ele.id()] = percent;
            return percent;
          };
          var sortFn = function(a, b) {
            var apct = getWeightedPercent(a);
            var bpct = getWeightedPercent(b);
            return apct - bpct;
          };
          for (var times = 0; times < 3; times++) {
            for (var i = 0; i < depths.length; i++) {
              depths[i] = depths[i].sort(sortFn);
            }
            assignDepthsToEles();
          }
          var biggestDepthSize = 0;
          for (var i = 0; i < depths.length; i++) {
            biggestDepthSize = Math.max(depths[i].length, biggestDepthSize);
          }
          var center = {
            x: bb.x1 + bb.w / 2,
            y: bb.x1 + bb.h / 2
          };
          var getPosition = function(ele, isBottomDepth) {
            var info = ele._private.scratch.breadthfirst;
            var depth = info.depth;
            var index = info.index;
            var depthSize = depths[depth].length;
            var distanceX = Math.max(bb.w / (depthSize + 1), minDistance);
            var distanceY = Math.max(bb.h / (depths.length + 1), minDistance);
            var radiusStepSize = Math.min(bb.w / 2 / depths.length, bb.h / 2 / depths.length);
            radiusStepSize = Math.max(radiusStepSize, minDistance);
            if (!options.circle) {
              var epos = {
                x: center.x + (index + 1 - (depthSize + 1) / 2) * distanceX,
                y: (depth + 1) * distanceY
              };
              if (isBottomDepth) {
                return epos;
              }
              return epos;
            } else {
              if (options.circle) {
                var radius = radiusStepSize * depth + radiusStepSize - (depths.length > 0 && depths[0].length <= 3 ? radiusStepSize / 2 : 0);
                var theta = 2 * Math.PI / depths[depth].length * index;
                if (depth === 0 && depths[0].length === 1) {
                  radius = 1;
                }
                return {
                  x: center.x + radius * Math.cos(theta),
                  y: center.y + radius * Math.sin(theta)
                };
              } else {
                return {
                  x: center.x + (index + 1 - (depthSize + 1) / 2) * distanceX,
                  y: (depth + 1) * distanceY
                };
              }
            }
          };
          var pos = {};
          for (var i = depths.length - 1; i >= 0; i--) {
            var depth = depths[i];
            for (var j = 0; j < depth.length; j++) {
              var node = depth[j];
              pos[node.id()] = getPosition(node, i === depths.length - 1);
            }
          }
          nodes.layoutPositions(this, options, function() {
            return pos[this.id()];
          });
          return this;
        };
        module.exports = BreadthFirstLayout;
      }, {
        "../../is": 77,
        "../../math": 79,
        "../../util": 94
      }],
      46: [function(_dereq_, module, exports) {
        'use strict';
        var util = _dereq_('../../util');
        var math = _dereq_('../../math');
        var is = _dereq_('../../is');
        var defaults = {
          fit: true,
          padding: 30,
          boundingBox: undefined,
          avoidOverlap: true,
          radius: undefined,
          startAngle: 3 / 2 * Math.PI,
          sweep: undefined,
          clockwise: true,
          sort: undefined,
          animate: false,
          animationDuration: 500,
          animationEasing: undefined,
          ready: undefined,
          stop: undefined
        };
        function CircleLayout(options) {
          this.options = util.extend({}, defaults, options);
        }
        CircleLayout.prototype.run = function() {
          var params = this.options;
          var options = params;
          var cy = params.cy;
          var eles = options.eles;
          var clockwise = options.counterclockwise !== undefined ? !options.counterclockwise : options.clockwise;
          var nodes = eles.nodes().not(':parent');
          if (options.sort) {
            nodes = nodes.sort(options.sort);
          }
          var bb = math.makeBoundingBox(options.boundingBox ? options.boundingBox : {
            x1: 0,
            y1: 0,
            w: cy.width(),
            h: cy.height()
          });
          var center = {
            x: bb.x1 + bb.w / 2,
            y: bb.y1 + bb.h / 2
          };
          var sweep = options.sweep === undefined ? 2 * Math.PI - 2 * Math.PI / nodes.length : options.sweep;
          var dTheta = sweep / (Math.max(1, nodes.length - 1));
          var r;
          var minDistance = 0;
          for (var i = 0; i < nodes.length; i++) {
            var n = nodes[i];
            var nbb = n.boundingBox();
            var w = nbb.w;
            var h = nbb.h;
            minDistance = Math.max(minDistance, w, h);
          }
          if (is.number(options.radius)) {
            r = options.radius;
          } else if (nodes.length <= 1) {
            r = 0;
          } else {
            r = Math.min(bb.h, bb.w) / 2 - minDistance;
          }
          if (nodes.length > 1 && options.avoidOverlap) {
            minDistance *= 1.75;
            var dcos = Math.cos(dTheta) - Math.cos(0);
            var dsin = Math.sin(dTheta) - Math.sin(0);
            var rMin = Math.sqrt(minDistance * minDistance / (dcos * dcos + dsin * dsin));
            r = Math.max(rMin, r);
          }
          var getPos = function(i, ele) {
            var theta = options.startAngle + i * dTheta * (clockwise ? 1 : -1);
            var rx = r * Math.cos(theta);
            var ry = r * Math.sin(theta);
            var pos = {
              x: center.x + rx,
              y: center.y + ry
            };
            return pos;
          };
          nodes.layoutPositions(this, options, getPos);
          return this;
        };
        module.exports = CircleLayout;
      }, {
        "../../is": 77,
        "../../math": 79,
        "../../util": 94
      }],
      47: [function(_dereq_, module, exports) {
        'use strict';
        var util = _dereq_('../../util');
        var math = _dereq_('../../math');
        var defaults = {
          fit: true,
          padding: 30,
          startAngle: 3 / 2 * Math.PI,
          sweep: undefined,
          clockwise: true,
          equidistant: false,
          minNodeSpacing: 10,
          boundingBox: undefined,
          avoidOverlap: true,
          height: undefined,
          width: undefined,
          concentric: function(node) {
            return node.degree();
          },
          levelWidth: function(nodes) {
            return nodes.maxDegree() / 4;
          },
          animate: false,
          animationDuration: 500,
          animationEasing: undefined,
          ready: undefined,
          stop: undefined
        };
        function ConcentricLayout(options) {
          this.options = util.extend({}, defaults, options);
        }
        ConcentricLayout.prototype.run = function() {
          var params = this.options;
          var options = params;
          var clockwise = options.counterclockwise !== undefined ? !options.counterclockwise : options.clockwise;
          var cy = params.cy;
          var eles = options.eles;
          var nodes = eles.nodes().not(':parent');
          var bb = math.makeBoundingBox(options.boundingBox ? options.boundingBox : {
            x1: 0,
            y1: 0,
            w: cy.width(),
            h: cy.height()
          });
          var center = {
            x: bb.x1 + bb.w / 2,
            y: bb.y1 + bb.h / 2
          };
          var nodeValues = [];
          var theta = options.startAngle;
          var maxNodeSize = 0;
          for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            var value;
            value = options.concentric.apply(node, [node]);
            nodeValues.push({
              value: value,
              node: node
            });
            node._private.scratch.concentric = value;
          }
          nodes.updateStyle();
          for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            var nbb = node.boundingBox();
            maxNodeSize = Math.max(maxNodeSize, nbb.w, nbb.h);
          }
          nodeValues.sort(function(a, b) {
            return b.value - a.value;
          });
          var levelWidth = options.levelWidth(nodes);
          var levels = [[]];
          var currentLevel = levels[0];
          for (var i = 0; i < nodeValues.length; i++) {
            var val = nodeValues[i];
            if (currentLevel.length > 0) {
              var diff = Math.abs(currentLevel[0].value - val.value);
              if (diff >= levelWidth) {
                currentLevel = [];
                levels.push(currentLevel);
              }
            }
            currentLevel.push(val);
          }
          var minDist = maxNodeSize + options.minNodeSpacing;
          if (!options.avoidOverlap) {
            var firstLvlHasMulti = levels.length > 0 && levels[0].length > 1;
            var maxR = (Math.min(bb.w, bb.h) / 2 - minDist);
            var rStep = maxR / (levels.length + firstLvlHasMulti ? 1 : 0);
            minDist = Math.min(minDist, rStep);
          }
          var r = 0;
          for (var i = 0; i < levels.length; i++) {
            var level = levels[i];
            var sweep = options.sweep === undefined ? 2 * Math.PI - 2 * Math.PI / level.length : options.sweep;
            var dTheta = level.dTheta = sweep / (Math.max(1, level.length - 1));
            if (level.length > 1 && options.avoidOverlap) {
              var dcos = Math.cos(dTheta) - Math.cos(0);
              var dsin = Math.sin(dTheta) - Math.sin(0);
              var rMin = Math.sqrt(minDist * minDist / (dcos * dcos + dsin * dsin));
              r = Math.max(rMin, r);
            }
            level.r = r;
            r += minDist;
          }
          if (options.equidistant) {
            var rDeltaMax = 0;
            var r = 0;
            for (var i = 0; i < levels.length; i++) {
              var level = levels[i];
              var rDelta = level.r - r;
              rDeltaMax = Math.max(rDeltaMax, rDelta);
            }
            r = 0;
            for (var i = 0; i < levels.length; i++) {
              var level = levels[i];
              if (i === 0) {
                r = level.r;
              }
              level.r = r;
              r += rDeltaMax;
            }
          }
          var pos = {};
          for (var i = 0; i < levels.length; i++) {
            var level = levels[i];
            var dTheta = level.dTheta;
            var r = level.r;
            for (var j = 0; j < level.length; j++) {
              var val = level[j];
              var theta = options.startAngle + (clockwise ? 1 : -1) * dTheta * j;
              var p = {
                x: center.x + r * Math.cos(theta),
                y: center.y + r * Math.sin(theta)
              };
              pos[val.node.id()] = p;
            }
          }
          nodes.layoutPositions(this, options, function() {
            var id = this.id();
            return pos[id];
          });
          return this;
        };
        module.exports = ConcentricLayout;
      }, {
        "../../math": 79,
        "../../util": 94
      }],
      48: [function(_dereq_, module, exports) {
        'use strict';
        var util = _dereq_('../../util');
        var math = _dereq_('../../math');
        var Thread = _dereq_('../../thread');
        var is = _dereq_('../../is');
        var DEBUG;
        var defaults = {
          ready: function() {},
          stop: function() {},
          animate: true,
          animationThreshold: 250,
          refresh: 20,
          fit: true,
          padding: 30,
          boundingBox: undefined,
          componentSpacing: 100,
          nodeRepulsion: function(node) {
            return 400000;
          },
          nodeOverlap: 10,
          idealEdgeLength: function(edge) {
            return 10;
          },
          edgeElasticity: function(edge) {
            return 100;
          },
          nestingFactor: 5,
          gravity: 80,
          numIter: 1000,
          initialTemp: 200,
          coolingFactor: 0.95,
          minTemp: 1.0,
          useMultitasking: true
        };
        function CoseLayout(options) {
          this.options = util.extend({}, defaults, options);
          this.options.layout = this;
        }
        CoseLayout.prototype.run = function() {
          var options = this.options;
          var cy = options.cy;
          var layout = this;
          var thread = this.thread;
          if (!thread || thread.stopped()) {
            thread = this.thread = Thread({disabled: !options.useMultitasking});
          }
          layout.stopped = false;
          layout.trigger({
            type: 'layoutstart',
            layout: layout
          });
          if (true === options.debug) {
            DEBUG = true;
          } else {
            DEBUG = false;
          }
          var layoutInfo = createLayoutInfo(cy, layout, options);
          if (DEBUG) {
            printLayoutInfo(layoutInfo);
          }
          randomizePositions(layoutInfo, cy);
          var startTime = Date.now();
          var refreshRequested = false;
          var refresh = function(rOpts) {
            rOpts = rOpts || {};
            if (refreshRequested && !rOpts.next) {
              return;
            }
            if (!rOpts.force && Date.now() - startTime < options.animationThreshold) {
              return;
            }
            refreshRequested = true;
            util.requestAnimationFrame(function() {
              refreshPositions(layoutInfo, cy, options);
              if (true === options.fit) {
                cy.fit(options.padding);
              }
              refreshRequested = false;
              if (rOpts.next) {
                rOpts.next();
              }
            });
          };
          thread.on('message', function(e) {
            var layoutNodes = e.message;
            layoutInfo.layoutNodes = layoutNodes;
            refresh();
          });
          thread.pass({
            layoutInfo: layoutInfo,
            options: {
              animate: options.animate,
              refresh: options.refresh,
              componentSpacing: options.componentSpacing,
              nodeOverlap: options.nodeOverlap,
              nestingFactor: options.nestingFactor,
              gravity: options.gravity,
              numIter: options.numIter,
              initialTemp: options.initialTemp,
              coolingFactor: options.coolingFactor,
              minTemp: options.minTemp
            }
          }).run(function(pass) {
            var layoutInfo = pass.layoutInfo;
            var options = pass.options;
            var stopped = false;
            var step = function(layoutInfo, options, step) {
              calculateNodeForces(layoutInfo, options);
              calculateEdgeForces(layoutInfo, options);
              calculateGravityForces(layoutInfo, options);
              propagateForces(layoutInfo, options);
              updatePositions(layoutInfo, options);
            };
            var calculateNodeForces = function(layoutInfo, options) {
              for (var i = 0; i < layoutInfo.graphSet.length; i++) {
                var graph = layoutInfo.graphSet[i];
                var numNodes = graph.length;
                for (var j = 0; j < numNodes; j++) {
                  var node1 = layoutInfo.layoutNodes[layoutInfo.idToIndex[graph[j]]];
                  for (var k = j + 1; k < numNodes; k++) {
                    var node2 = layoutInfo.layoutNodes[layoutInfo.idToIndex[graph[k]]];
                    nodeRepulsion(node1, node2, layoutInfo, options);
                  }
                }
              }
            };
            var nodeRepulsion = function(node1, node2, layoutInfo, options) {
              var cmptId1 = node1.cmptId;
              var cmptId2 = node2.cmptId;
              if (cmptId1 !== cmptId2 && !layoutInfo.isCompound) {
                return;
              }
              var directionX = node2.positionX - node1.positionX;
              var directionY = node2.positionY - node1.positionY;
              if (0 === directionX && 0 === directionY) {
                return;
              }
              var overlap = nodesOverlap(node1, node2, directionX, directionY);
              if (overlap > 0) {
                var force = options.nodeOverlap * overlap;
                var distance = Math.sqrt(directionX * directionX + directionY * directionY);
                var forceX = force * directionX / distance;
                var forceY = force * directionY / distance;
              } else {
                var point1 = findClippingPoint(node1, directionX, directionY);
                var point2 = findClippingPoint(node2, -1 * directionX, -1 * directionY);
                var distanceX = point2.x - point1.x;
                var distanceY = point2.y - point1.y;
                var distanceSqr = distanceX * distanceX + distanceY * distanceY;
                var distance = Math.sqrt(distanceSqr);
                var force = (node1.nodeRepulsion + node2.nodeRepulsion) / distanceSqr;
                var forceX = force * distanceX / distance;
                var forceY = force * distanceY / distance;
              }
              if (!node1.isLocked) {
                node1.offsetX -= forceX;
                node1.offsetY -= forceY;
              }
              if (!node2.isLocked) {
                node2.offsetX += forceX;
                node2.offsetY += forceY;
              }
              return;
            };
            var nodesOverlap = function(node1, node2, dX, dY) {
              if (dX > 0) {
                var overlapX = node1.maxX - node2.minX;
              } else {
                var overlapX = node2.maxX - node1.minX;
              }
              if (dY > 0) {
                var overlapY = node1.maxY - node2.minY;
              } else {
                var overlapY = node2.maxY - node1.minY;
              }
              if (overlapX >= 0 && overlapY >= 0) {
                return Math.sqrt(overlapX * overlapX + overlapY * overlapY);
              } else {
                return 0;
              }
            };
            var findClippingPoint = function(node, dX, dY) {
              var X = node.positionX;
              var Y = node.positionY;
              var H = node.height || 1;
              var W = node.width || 1;
              var dirSlope = dY / dX;
              var nodeSlope = H / W;
              var res = {};
              do {
                if (0 === dX && 0 < dY) {
                  res.x = X;
                  res.y = Y + H / 2;
                  break;
                }
                if (0 === dX && 0 > dY) {
                  res.x = X;
                  res.y = Y + H / 2;
                  break;
                }
                if (0 < dX && -1 * nodeSlope <= dirSlope && dirSlope <= nodeSlope) {
                  res.x = X + W / 2;
                  res.y = Y + (W * dY / 2 / dX);
                  break;
                }
                if (0 > dX && -1 * nodeSlope <= dirSlope && dirSlope <= nodeSlope) {
                  res.x = X - W / 2;
                  res.y = Y - (W * dY / 2 / dX);
                  break;
                }
                if (0 < dY && (dirSlope <= -1 * nodeSlope || dirSlope >= nodeSlope)) {
                  res.x = X + (H * dX / 2 / dY);
                  res.y = Y + H / 2;
                  break;
                }
                if (0 > dY && (dirSlope <= -1 * nodeSlope || dirSlope >= nodeSlope)) {
                  res.x = X - (H * dX / 2 / dY);
                  res.y = Y - H / 2;
                  break;
                }
              } while (false);
              return res;
            };
            var calculateEdgeForces = function(layoutInfo, options) {
              for (var i = 0; i < layoutInfo.edgeSize; i++) {
                var edge = layoutInfo.layoutEdges[i];
                var sourceIx = layoutInfo.idToIndex[edge.sourceId];
                var source = layoutInfo.layoutNodes[sourceIx];
                var targetIx = layoutInfo.idToIndex[edge.targetId];
                var target = layoutInfo.layoutNodes[targetIx];
                var directionX = target.positionX - source.positionX;
                var directionY = target.positionY - source.positionY;
                if (0 === directionX && 0 === directionY) {
                  return;
                }
                var point1 = findClippingPoint(source, directionX, directionY);
                var point2 = findClippingPoint(target, -1 * directionX, -1 * directionY);
                var lx = point2.x - point1.x;
                var ly = point2.y - point1.y;
                var l = Math.sqrt(lx * lx + ly * ly);
                var force = Math.pow(edge.idealLength - l, 2) / edge.elasticity;
                if (0 !== l) {
                  var forceX = force * lx / l;
                  var forceY = force * ly / l;
                } else {
                  var forceX = 0;
                  var forceY = 0;
                }
                if (!source.isLocked) {
                  source.offsetX += forceX;
                  source.offsetY += forceY;
                }
                if (!target.isLocked) {
                  target.offsetX -= forceX;
                  target.offsetY -= forceY;
                }
              }
            };
            var calculateGravityForces = function(layoutInfo, options) {
              var distThreshold = 1;
              for (var i = 0; i < layoutInfo.graphSet.length; i++) {
                var graph = layoutInfo.graphSet[i];
                var numNodes = graph.length;
                if (0 === i) {
                  var centerX = layoutInfo.clientHeight / 2;
                  var centerY = layoutInfo.clientWidth / 2;
                } else {
                  var temp = layoutInfo.layoutNodes[layoutInfo.idToIndex[graph[0]]];
                  var parent = layoutInfo.layoutNodes[layoutInfo.idToIndex[temp.parentId]];
                  var centerX = parent.positionX;
                  var centerY = parent.positionY;
                }
                for (var j = 0; j < numNodes; j++) {
                  var node = layoutInfo.layoutNodes[layoutInfo.idToIndex[graph[j]]];
                  if (node.isLocked) {
                    continue;
                  }
                  var dx = centerX - node.positionX;
                  var dy = centerY - node.positionY;
                  var d = Math.sqrt(dx * dx + dy * dy);
                  if (d > distThreshold) {
                    var fx = options.gravity * dx / d;
                    var fy = options.gravity * dy / d;
                    node.offsetX += fx;
                    node.offsetY += fy;
                  } else {}
                }
              }
            };
            var propagateForces = function(layoutInfo, options) {
              var queue = [];
              var start = 0;
              var end = -1;
              queue.push.apply(queue, layoutInfo.graphSet[0]);
              end += layoutInfo.graphSet[0].length;
              while (start <= end) {
                var nodeId = queue[start++];
                var nodeIndex = layoutInfo.idToIndex[nodeId];
                var node = layoutInfo.layoutNodes[nodeIndex];
                var children = node.children;
                if (0 < children.length && !node.isLocked) {
                  var offX = node.offsetX;
                  var offY = node.offsetY;
                  for (var i = 0; i < children.length; i++) {
                    var childNode = layoutInfo.layoutNodes[layoutInfo.idToIndex[children[i]]];
                    childNode.offsetX += offX;
                    childNode.offsetY += offY;
                    queue[++end] = children[i];
                  }
                  node.offsetX = 0;
                  node.offsetY = 0;
                }
              }
            };
            var updatePositions = function(layoutInfo, options) {
              for (var i = 0; i < layoutInfo.nodeSize; i++) {
                var n = layoutInfo.layoutNodes[i];
                if (0 < n.children.length) {
                  n.maxX = undefined;
                  n.minX = undefined;
                  n.maxY = undefined;
                  n.minY = undefined;
                }
              }
              for (var i = 0; i < layoutInfo.nodeSize; i++) {
                var n = layoutInfo.layoutNodes[i];
                if (0 < n.children.length || n.isLocked) {
                  continue;
                }
                var tempForce = limitForce(n.offsetX, n.offsetY, layoutInfo.temperature);
                n.positionX += tempForce.x;
                n.positionY += tempForce.y;
                n.offsetX = 0;
                n.offsetY = 0;
                n.minX = n.positionX - n.width;
                n.maxX = n.positionX + n.width;
                n.minY = n.positionY - n.height;
                n.maxY = n.positionY + n.height;
                updateAncestryBoundaries(n, layoutInfo);
              }
              for (var i = 0; i < layoutInfo.nodeSize; i++) {
                var n = layoutInfo.layoutNodes[i];
                if (0 < n.children.length && !n.isLocked) {
                  n.positionX = (n.maxX + n.minX) / 2;
                  n.positionY = (n.maxY + n.minY) / 2;
                  n.width = n.maxX - n.minX;
                  n.height = n.maxY - n.minY;
                }
              }
            };
            var limitForce = function(forceX, forceY, max) {
              var force = Math.sqrt(forceX * forceX + forceY * forceY);
              if (force > max) {
                var res = {
                  x: max * forceX / force,
                  y: max * forceY / force
                };
              } else {
                var res = {
                  x: forceX,
                  y: forceY
                };
              }
              return res;
            };
            var updateAncestryBoundaries = function(node, layoutInfo) {
              var parentId = node.parentId;
              if (null == parentId) {
                return;
              }
              var p = layoutInfo.layoutNodes[layoutInfo.idToIndex[parentId]];
              var flag = false;
              if (null == p.maxX || node.maxX + p.padRight > p.maxX) {
                p.maxX = node.maxX + p.padRight;
                flag = true;
              }
              if (null == p.minX || node.minX - p.padLeft < p.minX) {
                p.minX = node.minX - p.padLeft;
                flag = true;
              }
              if (null == p.maxY || node.maxY + p.padBottom > p.maxY) {
                p.maxY = node.maxY + p.padBottom;
                flag = true;
              }
              if (null == p.minY || node.minY - p.padTop < p.minY) {
                p.minY = node.minY - p.padTop;
                flag = true;
              }
              if (flag) {
                return updateAncestryBoundaries(p, layoutInfo);
              }
              return;
            };
            var separateComponents = function(layutInfo, options) {
              var nodes = layoutInfo.layoutNodes;
              var components = [];
              for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                var cid = node.cmptId;
                var component = components[cid] = components[cid] || [];
                component.push(node);
              }
              var totalA = 0;
              for (var i = 0; i < components.length; i++) {
                var c = components[i];
                c.x1 = Infinity;
                c.x2 = -Infinity;
                c.y1 = Infinity;
                c.y2 = -Infinity;
                for (var j = 0; j < c.length; j++) {
                  var n = c[j];
                  c.x1 = Math.min(c.x1, n.positionX - n.width / 2);
                  c.x2 = Math.max(c.x2, n.positionX + n.width / 2);
                  c.y1 = Math.min(c.y1, n.positionY - n.height / 2);
                  c.y2 = Math.max(c.y2, n.positionY + n.height / 2);
                }
                c.w = c.x2 - c.x1;
                c.h = c.y2 - c.y1;
                totalA += c.w * c.h;
              }
              components.sort(function(c1, c2) {
                return c2.w * c2.h - c1.w * c1.h;
              });
              var x = 0;
              var y = 0;
              var usedW = 0;
              var rowH = 0;
              var maxRowW = Math.sqrt(totalA) * layoutInfo.clientWidth / layoutInfo.clientHeight;
              for (var i = 0; i < components.length; i++) {
                var c = components[i];
                for (var j = 0; j < c.length; j++) {
                  var n = c[j];
                  if (!n.isLocked) {
                    n.positionX += x;
                    n.positionY += y;
                  }
                }
                x += c.w + options.componentSpacing;
                usedW += c.w + options.componentSpacing;
                rowH = Math.max(rowH, c.h);
                if (usedW > maxRowW) {
                  y += rowH + options.componentSpacing;
                  x = 0;
                  usedW = 0;
                  rowH = 0;
                }
              }
            };
            var mainLoop = function(i) {
              if (stopped) {
                return false;
              }
              step(layoutInfo, options, i);
              layoutInfo.temperature = layoutInfo.temperature * options.coolingFactor;
              if (layoutInfo.temperature < options.minTemp) {
                return false;
              }
              return true;
            };
            var i = 0;
            var loopRet;
            do {
              var f = 0;
              while (f < options.refresh && i < options.numIter) {
                var loopRet = mainLoop(i);
                if (!loopRet) {
                  break;
                }
                f++;
                i++;
              }
              if (options.animate) {
                broadcast(layoutInfo.layoutNodes);
              }
            } while (loopRet && i + 1 < options.numIter);
            separateComponents(layoutInfo, options);
            return layoutInfo;
          }).then(function(layoutInfoUpdated) {
            layoutInfo.layoutNodes = layoutInfoUpdated.layoutNodes;
            thread.stop();
            done();
          });
          var done = function() {
            refresh({
              force: true,
              next: function() {
                layout.one('layoutstop', options.stop);
                layout.trigger({
                  type: 'layoutstop',
                  layout: layout
                });
              }
            });
          };
          return this;
        };
        CoseLayout.prototype.stop = function() {
          this.stopped = true;
          if (this.thread) {
            this.thread.stop();
          }
          this.trigger('layoutstop');
          return this;
        };
        CoseLayout.prototype.destroy = function() {
          if (this.thread) {
            this.thread.stop();
          }
          return this;
        };
        var createLayoutInfo = function(cy, layout, options) {
          var edges = options.eles.edges();
          var nodes = options.eles.nodes();
          var layoutInfo = {
            isCompound: cy.hasCompoundNodes(),
            layoutNodes: [],
            idToIndex: {},
            nodeSize: nodes.size(),
            graphSet: [],
            indexToGraph: [],
            layoutEdges: [],
            edgeSize: edges.size(),
            temperature: options.initialTemp,
            clientWidth: cy.width(),
            clientHeight: cy.width(),
            boundingBox: math.makeBoundingBox(options.boundingBox ? options.boundingBox : {
              x1: 0,
              y1: 0,
              w: cy.width(),
              h: cy.height()
            })
          };
          var components = options.eles.components();
          var id2cmptId = {};
          for (var i = 0; i < components.length; i++) {
            var component = components[i];
            for (var j = 0; j < component.length; j++) {
              var node = component[j];
              id2cmptId[node.id()] = i;
            }
          }
          for (var i = 0; i < layoutInfo.nodeSize; i++) {
            var n = nodes[i];
            var nbb = n.boundingBox();
            var tempNode = {};
            tempNode.isLocked = n.locked();
            tempNode.id = n.data('id');
            tempNode.parentId = n.data('parent');
            tempNode.cmptId = id2cmptId[n.id()];
            tempNode.children = [];
            tempNode.positionX = n.position('x');
            tempNode.positionY = n.position('y');
            tempNode.offsetX = 0;
            tempNode.offsetY = 0;
            tempNode.height = nbb.w;
            tempNode.width = nbb.h;
            tempNode.maxX = tempNode.positionX + tempNode.width / 2;
            tempNode.minX = tempNode.positionX - tempNode.width / 2;
            tempNode.maxY = tempNode.positionY + tempNode.height / 2;
            tempNode.minY = tempNode.positionY - tempNode.height / 2;
            tempNode.padLeft = parseFloat(n.style('padding-left'));
            tempNode.padRight = parseFloat(n.style('padding-right'));
            tempNode.padTop = parseFloat(n.style('padding-top'));
            tempNode.padBottom = parseFloat(n.style('padding-bottom'));
            tempNode.nodeRepulsion = is.fn(options.nodeRepulsion) ? options.nodeRepulsion.call(n, n) : options.nodeRepulsion;
            layoutInfo.layoutNodes.push(tempNode);
            layoutInfo.idToIndex[tempNode.id] = i;
          }
          var queue = [];
          var start = 0;
          var end = -1;
          var tempGraph = [];
          for (var i = 0; i < layoutInfo.nodeSize; i++) {
            var n = layoutInfo.layoutNodes[i];
            var p_id = n.parentId;
            if (null != p_id) {
              layoutInfo.layoutNodes[layoutInfo.idToIndex[p_id]].children.push(n.id);
            } else {
              queue[++end] = n.id;
              tempGraph.push(n.id);
            }
          }
          layoutInfo.graphSet.push(tempGraph);
          while (start <= end) {
            var node_id = queue[start++];
            var node_ix = layoutInfo.idToIndex[node_id];
            var node = layoutInfo.layoutNodes[node_ix];
            var children = node.children;
            if (children.length > 0) {
              layoutInfo.graphSet.push(children);
              for (var i = 0; i < children.length; i++) {
                queue[++end] = children[i];
              }
            }
          }
          for (var i = 0; i < layoutInfo.graphSet.length; i++) {
            var graph = layoutInfo.graphSet[i];
            for (var j = 0; j < graph.length; j++) {
              var index = layoutInfo.idToIndex[graph[j]];
              layoutInfo.indexToGraph[index] = i;
            }
          }
          for (var i = 0; i < layoutInfo.edgeSize; i++) {
            var e = edges[i];
            var tempEdge = {};
            tempEdge.id = e.data('id');
            tempEdge.sourceId = e.data('source');
            tempEdge.targetId = e.data('target');
            var idealLength = is.fn(options.idealEdgeLength) ? options.idealEdgeLength.call(e, e) : options.idealEdgeLength;
            var elasticity = is.fn(options.edgeElasticity) ? options.edgeElasticity.call(e, e) : options.edgeElasticity;
            var sourceIx = layoutInfo.idToIndex[tempEdge.sourceId];
            var targetIx = layoutInfo.idToIndex[tempEdge.targetId];
            var sourceGraph = layoutInfo.indexToGraph[sourceIx];
            var targetGraph = layoutInfo.indexToGraph[targetIx];
            if (sourceGraph != targetGraph) {
              var lca = findLCA(tempEdge.sourceId, tempEdge.targetId, layoutInfo);
              var lcaGraph = layoutInfo.graphSet[lca];
              var depth = 0;
              var tempNode = layoutInfo.layoutNodes[sourceIx];
              while (-1 === lcaGraph.indexOf(tempNode.id)) {
                tempNode = layoutInfo.layoutNodes[layoutInfo.idToIndex[tempNode.parentId]];
                depth++;
              }
              tempNode = layoutInfo.layoutNodes[targetIx];
              while (-1 === lcaGraph.indexOf(tempNode.id)) {
                tempNode = layoutInfo.layoutNodes[layoutInfo.idToIndex[tempNode.parentId]];
                depth++;
              }
              idealLength *= depth * options.nestingFactor;
            }
            tempEdge.idealLength = idealLength;
            tempEdge.elasticity = elasticity;
            layoutInfo.layoutEdges.push(tempEdge);
          }
          return layoutInfo;
        };
        var findLCA = function(node1, node2, layoutInfo) {
          var res = findLCA_aux(node1, node2, 0, layoutInfo);
          if (2 > res.count) {
            return 0;
          } else {
            return res.graph;
          }
        };
        var findLCA_aux = function(node1, node2, graphIx, layoutInfo) {
          var graph = layoutInfo.graphSet[graphIx];
          if (-1 < graph.indexOf(node1) && -1 < graph.indexOf(node2)) {
            return {
              count: 2,
              graph: graphIx
            };
          }
          var c = 0;
          for (var i = 0; i < graph.length; i++) {
            var nodeId = graph[i];
            var nodeIx = layoutInfo.idToIndex[nodeId];
            var children = layoutInfo.layoutNodes[nodeIx].children;
            if (0 === children.length) {
              continue;
            }
            var childGraphIx = layoutInfo.indexToGraph[layoutInfo.idToIndex[children[0]]];
            var result = findLCA_aux(node1, node2, childGraphIx, layoutInfo);
            if (0 === result.count) {
              continue;
            } else if (1 === result.count) {
              c++;
              if (2 === c) {
                break;
              }
            } else {
              return result;
            }
          }
          return {
            count: c,
            graph: graphIx
          };
        };
        var printLayoutInfo = function(layoutInfo) {
          if (!DEBUG) {
            return;
          }
          console.debug("layoutNodes:");
          for (var i = 0; i < layoutInfo.nodeSize; i++) {
            var n = layoutInfo.layoutNodes[i];
            var s = "\nindex: " + i + "\nId: " + n.id + "\nChildren: " + n.children.toString() + "\nparentId: " + n.parentId + "\npositionX: " + n.positionX + "\npositionY: " + n.positionY + "\nOffsetX: " + n.offsetX + "\nOffsetY: " + n.offsetY + "\npadLeft: " + n.padLeft + "\npadRight: " + n.padRight + "\npadTop: " + n.padTop + "\npadBottom: " + n.padBottom;
            console.debug(s);
          }
          console.debug('idToIndex');
          for (var i in layoutInfo.idToIndex) {
            console.debug("Id: " + i + "\nIndex: " + layoutInfo.idToIndex[i]);
          }
          console.debug('Graph Set');
          var set = layoutInfo.graphSet;
          for (var i = 0; i < set.length; i++) {
            console.debug("Set : " + i + ": " + set[i].toString());
          }
          var s = 'IndexToGraph';
          for (var i = 0; i < layoutInfo.indexToGraph.length; i++) {
            s += "\nIndex : " + i + " Graph: " + layoutInfo.indexToGraph[i];
          }
          console.debug(s);
          s = 'Layout Edges';
          for (var i = 0; i < layoutInfo.layoutEdges.length; i++) {
            var e = layoutInfo.layoutEdges[i];
            s += "\nEdge Index: " + i + " ID: " + e.id + " SouceID: " + e.sourceId + " TargetId: " + e.targetId + " Ideal Length: " + e.idealLength;
          }
          console.debug(s);
          s = "nodeSize: " + layoutInfo.nodeSize;
          s += "\nedgeSize: " + layoutInfo.edgeSize;
          s += "\ntemperature: " + layoutInfo.temperature;
          console.debug(s);
          return;
        };
        var randomizePositions = function(layoutInfo, cy) {
          var width = layoutInfo.clientWidth;
          var height = layoutInfo.clientHeight;
          for (var i = 0; i < layoutInfo.nodeSize; i++) {
            var n = layoutInfo.layoutNodes[i];
            if (0 === n.children.length && !n.isLocked) {
              n.positionX = Math.random() * width;
              n.positionY = Math.random() * height;
            }
          }
        };
        var refreshPositions = function(layoutInfo, cy, options) {
          var layout = options.layout;
          var nodes = options.eles.nodes();
          var bb = layoutInfo.boundingBox;
          var coseBB = {
            x1: Infinity,
            x2: -Infinity,
            y1: Infinity,
            y2: -Infinity
          };
          if (options.boundingBox) {
            nodes.forEach(function(node) {
              var lnode = layoutInfo.layoutNodes[layoutInfo.idToIndex[node.data('id')]];
              coseBB.x1 = Math.min(coseBB.x1, lnode.positionX);
              coseBB.x2 = Math.max(coseBB.x2, lnode.positionX);
              coseBB.y1 = Math.min(coseBB.y1, lnode.positionY);
              coseBB.y2 = Math.max(coseBB.y2, lnode.positionY);
            });
            coseBB.w = coseBB.x2 - coseBB.x1;
            coseBB.h = coseBB.y2 - coseBB.y1;
          }
          nodes.positions(function(i, ele) {
            var lnode = layoutInfo.layoutNodes[layoutInfo.idToIndex[ele.data('id')]];
            if (options.boundingBox) {
              var pctX = (lnode.positionX - coseBB.x1) / coseBB.w;
              var pctY = (lnode.positionY - coseBB.y1) / coseBB.h;
              return {
                x: bb.x1 + pctX * bb.w,
                y: bb.y1 + pctY * bb.h
              };
            } else {
              return {
                x: lnode.positionX,
                y: lnode.positionY
              };
            }
          });
          if (true !== layoutInfo.ready) {
            layoutInfo.ready = true;
            layout.one('layoutready', options.ready);
            layout.trigger({
              type: 'layoutready',
              layout: this
            });
          }
        };
        module.exports = CoseLayout;
      }, {
        "../../is": 77,
        "../../math": 79,
        "../../thread": 92,
        "../../util": 94
      }],
      49: [function(_dereq_, module, exports) {
        'use strict';
        var util = _dereq_('../../util');
        var math = _dereq_('../../math');
        var defaults = {
          fit: true,
          padding: 30,
          boundingBox: undefined,
          avoidOverlap: true,
          avoidOverlapPadding: 10,
          condense: false,
          rows: undefined,
          cols: undefined,
          position: function(node) {},
          sort: undefined,
          animate: false,
          animationDuration: 500,
          animationEasing: undefined,
          ready: undefined,
          stop: undefined
        };
        function GridLayout(options) {
          this.options = util.extend({}, defaults, options);
        }
        GridLayout.prototype.run = function() {
          var params = this.options;
          var options = params;
          var cy = params.cy;
          var eles = options.eles;
          var nodes = eles.nodes().not(':parent');
          if (options.sort) {
            nodes = nodes.sort(options.sort);
          }
          var bb = math.makeBoundingBox(options.boundingBox ? options.boundingBox : {
            x1: 0,
            y1: 0,
            w: cy.width(),
            h: cy.height()
          });
          if (bb.h === 0 || bb.w === 0) {
            nodes.layoutPositions(this, options, function() {
              return {
                x: bb.x1,
                y: bb.y1
              };
            });
          } else {
            var cells = nodes.size();
            var splits = Math.sqrt(cells * bb.h / bb.w);
            var rows = Math.round(splits);
            var cols = Math.round(bb.w / bb.h * splits);
            var small = function(val) {
              if (val == null) {
                return Math.min(rows, cols);
              } else {
                var min = Math.min(rows, cols);
                if (min == rows) {
                  rows = val;
                } else {
                  cols = val;
                }
              }
            };
            var large = function(val) {
              if (val == null) {
                return Math.max(rows, cols);
              } else {
                var max = Math.max(rows, cols);
                if (max == rows) {
                  rows = val;
                } else {
                  cols = val;
                }
              }
            };
            var oRows = options.rows;
            var oCols = options.cols != null ? options.cols : options.columns;
            if (oRows != null && oCols != null) {
              rows = oRows;
              cols = oCols;
            } else if (oRows != null && oCols == null) {
              rows = oRows;
              cols = Math.ceil(cells / rows);
            } else if (oRows == null && oCols != null) {
              cols = oCols;
              rows = Math.ceil(cells / cols);
            } else if (cols * rows > cells) {
              var sm = small();
              var lg = large();
              if ((sm - 1) * lg >= cells) {
                small(sm - 1);
              } else if ((lg - 1) * sm >= cells) {
                large(lg - 1);
              }
            } else {
              while (cols * rows < cells) {
                var sm = small();
                var lg = large();
                if ((lg + 1) * sm >= cells) {
                  large(lg + 1);
                } else {
                  small(sm + 1);
                }
              }
            }
            var cellWidth = bb.w / cols;
            var cellHeight = bb.h / rows;
            if (options.condense) {
              cellWidth = 0;
              cellHeight = 0;
            }
            if (options.avoidOverlap) {
              for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                var pos = node._private.position;
                if (pos.x == null || pos.y == null) {
                  pos.x = 0;
                  pos.y = 0;
                }
                var nbb = node.boundingBox();
                var p = options.avoidOverlapPadding;
                var w = nbb.w + p;
                var h = nbb.h + p;
                cellWidth = Math.max(cellWidth, w);
                cellHeight = Math.max(cellHeight, h);
              }
            }
            var cellUsed = {};
            var used = function(row, col) {
              return cellUsed['c-' + row + '-' + col] ? true : false;
            };
            var use = function(row, col) {
              cellUsed['c-' + row + '-' + col] = true;
            };
            var row = 0;
            var col = 0;
            var moveToNextCell = function() {
              col++;
              if (col >= cols) {
                col = 0;
                row++;
              }
            };
            var id2manPos = {};
            for (var i = 0; i < nodes.length; i++) {
              var node = nodes[i];
              var rcPos = options.position(node);
              if (rcPos && (rcPos.row !== undefined || rcPos.col !== undefined)) {
                var pos = {
                  row: rcPos.row,
                  col: rcPos.col
                };
                if (pos.col === undefined) {
                  pos.col = 0;
                  while (used(pos.row, pos.col)) {
                    pos.col++;
                  }
                } else if (pos.row === undefined) {
                  pos.row = 0;
                  while (used(pos.row, pos.col)) {
                    pos.row++;
                  }
                }
                id2manPos[node.id()] = pos;
                use(pos.row, pos.col);
              }
            }
            var getPos = function(i, element) {
              var x,
                  y;
              if (element.locked() || element.isFullAutoParent()) {
                return false;
              }
              var rcPos = id2manPos[element.id()];
              if (rcPos) {
                x = rcPos.col * cellWidth + cellWidth / 2 + bb.x1;
                y = rcPos.row * cellHeight + cellHeight / 2 + bb.y1;
              } else {
                while (used(row, col)) {
                  moveToNextCell();
                }
                x = col * cellWidth + cellWidth / 2 + bb.x1;
                y = row * cellHeight + cellHeight / 2 + bb.y1;
                use(row, col);
                moveToNextCell();
              }
              return {
                x: x,
                y: y
              };
            };
            nodes.layoutPositions(this, options, getPos);
          }
          return this;
        };
        module.exports = GridLayout;
      }, {
        "../../math": 79,
        "../../util": 94
      }],
      50: [function(_dereq_, module, exports) {
        'use strict';
        module.exports = [{
          name: 'breadthfirst',
          impl: _dereq_('./breadthfirst')
        }, {
          name: 'circle',
          impl: _dereq_('./circle')
        }, {
          name: 'concentric',
          impl: _dereq_('./concentric')
        }, {
          name: 'cose',
          impl: _dereq_('./cose')
        }, {
          name: 'grid',
          impl: _dereq_('./grid')
        }, {
          name: 'null',
          impl: _dereq_('./null')
        }, {
          name: 'preset',
          impl: _dereq_('./preset')
        }, {
          name: 'random',
          impl: _dereq_('./random')
        }];
      }, {
        "./breadthfirst": 45,
        "./circle": 46,
        "./concentric": 47,
        "./cose": 48,
        "./grid": 49,
        "./null": 51,
        "./preset": 52,
        "./random": 53
      }],
      51: [function(_dereq_, module, exports) {
        'use strict';
        var util = _dereq_('../../util');
        var defaults = {
          ready: function() {},
          stop: function() {}
        };
        function NullLayout(options) {
          this.options = util.extend({}, defaults, options);
        }
        NullLayout.prototype.run = function() {
          var options = this.options;
          var eles = options.eles;
          var layout = this;
          var cy = options.cy;
          layout.trigger('layoutstart');
          eles.nodes().positions(function() {
            return {
              x: 0,
              y: 0
            };
          });
          layout.one('layoutready', options.ready);
          layout.trigger('layoutready');
          layout.one('layoutstop', options.stop);
          layout.trigger('layoutstop');
          return this;
        };
        NullLayout.prototype.stop = function() {
          return this;
        };
        module.exports = NullLayout;
      }, {"../../util": 94}],
      52: [function(_dereq_, module, exports) {
        'use strict';
        var util = _dereq_('../../util');
        var is = _dereq_('../../is');
        var defaults = {
          positions: undefined,
          zoom: undefined,
          pan: undefined,
          fit: true,
          padding: 30,
          animate: false,
          animationDuration: 500,
          animationEasing: undefined,
          ready: undefined,
          stop: undefined
        };
        function PresetLayout(options) {
          this.options = util.extend({}, defaults, options);
        }
        PresetLayout.prototype.run = function() {
          var options = this.options;
          var eles = options.eles;
          var nodes = eles.nodes();
          var posIsFn = is.fn(options.positions);
          function getPosition(node) {
            if (options.positions == null) {
              return null;
            }
            if (posIsFn) {
              return options.positions.apply(node, [node]);
            }
            var pos = options.positions[node._private.data.id];
            if (pos == null) {
              return null;
            }
            return pos;
          }
          nodes.layoutPositions(this, options, function(i, node) {
            var position = getPosition(node);
            if (node.locked() || position == null) {
              return false;
            }
            return position;
          });
          return this;
        };
        module.exports = PresetLayout;
      }, {
        "../../is": 77,
        "../../util": 94
      }],
      53: [function(_dereq_, module, exports) {
        'use strict';
        var util = _dereq_('../../util');
        var math = _dereq_('../../math');
        var defaults = {
          fit: true,
          padding: 30,
          boundingBox: undefined,
          animate: false,
          animationDuration: 500,
          animationEasing: undefined,
          ready: undefined,
          stop: undefined
        };
        function RandomLayout(options) {
          this.options = util.extend({}, defaults, options);
        }
        RandomLayout.prototype.run = function() {
          var options = this.options;
          var cy = options.cy;
          var eles = options.eles;
          var nodes = eles.nodes().not(':parent');
          var bb = math.makeBoundingBox(options.boundingBox ? options.boundingBox : {
            x1: 0,
            y1: 0,
            w: cy.width(),
            h: cy.height()
          });
          var getPos = function(i, node) {
            return {
              x: bb.x1 + Math.round(Math.random() * bb.w),
              y: bb.y1 + Math.round(Math.random() * bb.h)
            };
          };
          nodes.layoutPositions(this, options, getPos);
          return this;
        };
        module.exports = RandomLayout;
      }, {
        "../../math": 79,
        "../../util": 94
      }],
      54: [function(_dereq_, module, exports) {
        'use strict';
        var math = _dereq_('../../../math');
        var is = _dereq_('../../../is');
        var util = _dereq_('../../../util');
        var BRp = {};
        BRp.arrowShapeHeight = 0.3;
        BRp.registerArrowShapes = function() {
          var arrowShapes = this.arrowShapes = {};
          var renderer = this;
          var bbCollide = function(x, y, size, angle, translation, padding) {
            var x1 = translation.x - size / 2 - padding;
            var x2 = translation.x + size / 2 + padding;
            var y1 = translation.y - size / 2 - padding;
            var y2 = translation.y + size / 2 + padding;
            var inside = (x1 <= x && x <= x2) && (y1 <= y && y <= y2);
            return inside;
          };
          var transform = function(x, y, size, angle, translation) {
            var xRotated = x * Math.cos(angle) - y * Math.sin(angle);
            var yRotated = x * Math.sin(angle) + y * Math.cos(angle);
            var xScaled = xRotated * size;
            var yScaled = yRotated * size;
            var xTranslated = xScaled + translation.x;
            var yTranslated = yScaled + translation.y;
            return {
              x: xTranslated,
              y: yTranslated
            };
          };
          var transformPoints = function(pts, size, angle, translation) {
            var retPts = [];
            for (var i = 0; i < pts.length; i += 2) {
              var x = pts[i];
              var y = pts[i + 1];
              retPts.push(transform(x, y, size, angle, translation));
            }
            return retPts;
          };
          var pointsToArr = function(pts) {
            var ret = [];
            for (var i = 0; i < pts.length; i++) {
              var p = pts[i];
              ret.push(p.x, p.y);
            }
            return ret;
          };
          var defineArrowShape = function(name, defn) {
            if (is.string(defn)) {
              defn = arrowShapes[defn];
            }
            arrowShapes[name] = util.extend({
              name: name,
              points: [-0.15, -0.3, 0.15, -0.3, 0.15, 0.3, -0.15, 0.3],
              collide: function(x, y, size, angle, translation, padding) {
                var points = pointsToArr(transformPoints(this.points, size + 2 * padding, angle, translation));
                var inside = math.pointInsidePolygonPoints(x, y, points);
                return inside;
              },
              roughCollide: bbCollide,
              draw: function(context, size, angle, translation) {
                var points = transformPoints(this.points, size, angle, translation);
                renderer.arrowShapeImpl('polygon')(context, points);
              },
              spacing: function(edge) {
                return 0;
              },
              gap: function(edge) {
                return edge._private.style['width'].pfValue * 2;
              }
            }, defn);
          };
          defineArrowShape('none', {
            collide: util.falsify,
            roughCollide: util.falsify,
            draw: util.noop,
            spacing: util.zeroify,
            gap: util.zeroify
          });
          defineArrowShape('triangle', {points: [-0.15, -0.3, 0, 0, 0.15, -0.3]});
          defineArrowShape('arrow', 'triangle');
          defineArrowShape('triangle-backcurve', {
            points: arrowShapes['triangle'].points,
            controlPoint: [0, -0.15],
            roughCollide: bbCollide,
            draw: function(context, size, angle, translation) {
              var ptsTrans = transformPoints(this.points, size, angle, translation);
              var ctrlPt = this.controlPoint;
              var ctrlPtTrans = transform(ctrlPt[0], ctrlPt[1], size, angle, translation);
              renderer.arrowShapeImpl(this.name)(context, ptsTrans, ctrlPtTrans);
            },
            gap: function(edge) {
              return edge._private.style['width'].pfValue;
            }
          });
          defineArrowShape('triangle-tee', {
            points: [-0.15, -0.3, 0, 0, 0.15, -0.3, -0.15, -0.3],
            pointsTee: [-0.15, -0.4, -0.15, -0.5, 0.15, -0.5, 0.15, -0.4],
            collide: function(x, y, size, angle, translation, padding) {
              var triPts = pointsToArr(transformPoints(this.points, size + 2 * padding, angle, translation));
              var teePts = pointsToArr(transformPoints(this.pointsTee, size + 2 * padding, angle, translation));
              var inside = math.pointInsidePolygonPoints(x, y, triPts) || math.pointInsidePolygonPoints(x, y, teePts);
              return inside;
            },
            draw: function(context, size, angle, translation) {
              var triPts = transformPoints(this.points, size, angle, translation);
              var teePts = transformPoints(this.pointsTee, size, angle, translation);
              renderer.arrowShapeImpl(this.name)(context, triPts, teePts);
            }
          });
          defineArrowShape('vee', {
            points: [-0.15, -0.3, 0, 0, 0.15, -0.3, 0, -0.15],
            gap: function(edge) {
              return edge._private.style['width'].pfValue;
            }
          });
          defineArrowShape('half-triangle-overshot', {
            points: [0, -0.25, -0.5, -0.25, 0.5, 0.25],
            leavePathOpen: true,
            matchEdgeWidth: true
          });
          defineArrowShape('circle', {
            radius: 0.15,
            collide: function(x, y, size, angle, translation, padding) {
              var t = translation;
              var inside = (Math.pow(t.x - x, 2) + Math.pow(t.y - y, 2) <= Math.pow((size + 2 * padding) * this.radius, 2));
              return inside;
            },
            draw: function(context, size, angle, translation) {
              renderer.arrowShapeImpl(this.name)(context, translation.x, translation.y, this.radius * size);
            },
            spacing: function(edge) {
              return renderer.getArrowWidth(edge._private.style['width'].pfValue) * this.radius;
            }
          });
          defineArrowShape('inhibitor', {
            points: [-0.25, 0, -0.25, -0.1, 0.25, -0.1, 0.25, 0],
            spacing: function(edge) {
              return 1;
            },
            gap: function(edge) {
              return 1;
            }
          });
          defineArrowShape('tee', 'inhibitor');
          defineArrowShape('square', {points: [-0.15, 0.00, 0.15, 0.00, 0.15, -0.3, -0.15, -0.3]});
          defineArrowShape('diamond', {
            points: [-0.15, -0.15, 0, -0.3, 0.15, -0.15, 0, 0],
            gap: function(edge) {
              return edge._private.style['width'].pfValue;
            }
          });
        };
        module.exports = BRp;
      }, {
        "../../../is": 77,
        "../../../math": 79,
        "../../../util": 94
      }],
      55: [function(_dereq_, module, exports) {
        'use strict';
        var BRp = {};
        var delEleCache = function(r) {
          r.eleEache = null;
        };
        var getEleCache = function(r) {
          if (!r.eleEache) {
            r.eleEache = {
              nodes: r.cy.nodes(),
              edges: r.cy.edges()
            };
          }
          return r.eleEache;
        };
        BRp.getCachedElements = function() {
          return getEleCache(this);
        };
        BRp.getCachedNodes = function() {
          return getEleCache(this).nodes;
        };
        BRp.getCachedEdges = function() {
          return getEleCache(this).edges;
        };
        BRp.updateElementsCache = function() {
          var r = this;
          delEleCache(r);
          return getEleCache(r);
        };
        module.exports = BRp;
      }, {}],
      56: [function(_dereq_, module, exports) {
        'use strict';
        var math = _dereq_('../../../math');
        var is = _dereq_('../../../is');
        var zIndexSort = _dereq_('../../../collection/zsort');
        var BRp = {};
        BRp.projectIntoViewport = function(clientX, clientY) {
          var offsets = this.findContainerClientCoords();
          var offsetLeft = offsets[0];
          var offsetTop = offsets[1];
          var x = clientX - offsetLeft;
          var y = clientY - offsetTop;
          x -= this.cy.pan().x;
          y -= this.cy.pan().y;
          x /= this.cy.zoom();
          y /= this.cy.zoom();
          return [x, y];
        };
        BRp.findContainerClientCoords = function() {
          var container = this.container;
          var bb = this.containerBB = this.containerBB || container.getBoundingClientRect();
          return [bb.left, bb.top, bb.right - bb.left, bb.bottom - bb.top];
        };
        BRp.invalidateContainerClientCoordsCache = function() {
          this.containerBB = null;
        };
        BRp.findNearestElement = function(x, y, visibleElementsOnly, isTouch) {
          var self = this;
          var r = this;
          var eles = r.getCachedZSortedEles();
          var near = [];
          var zoom = r.cy.zoom();
          var hasCompounds = r.cy.hasCompoundNodes();
          var edgeThreshold = (isTouch ? 24 : 8) / zoom;
          var nodeThreshold = (isTouch ? 8 : 2) / zoom;
          var labelThreshold = (isTouch ? 8 : 2) / zoom;
          function checkNode(node) {
            var _p = node._private;
            if (_p.style['events'].strValue === 'no') {
              return;
            }
            var width = node.outerWidth() + 2 * nodeThreshold;
            var height = node.outerHeight() + 2 * nodeThreshold;
            var hw = width / 2;
            var hh = height / 2;
            var pos = _p.position;
            if (pos.x - hw <= x && x <= pos.x + hw && pos.y - hh <= y && y <= pos.y + hh) {
              var visible = !visibleElementsOnly || (node.visible() && !node.transparent());
              if (visibleElementsOnly && !visible) {
                return;
              }
              var shape = r.nodeShapes[self.getNodeShape(node)];
              if (shape.checkPoint(x, y, 0, width, height, pos.x, pos.y)) {
                near.push(node);
              }
            }
          }
          function checkEdge(edge) {
            var _p = edge._private;
            if (_p.style['events'].strValue === 'no') {
              return;
            }
            var rs = _p.rscratch;
            var style = _p.style;
            var width = style['width'].pfValue / 2 + edgeThreshold;
            var widthSq = width * width;
            var width2 = width * 2;
            var src = _p.source;
            var tgt = _p.target;
            var inEdgeBB = false;
            var sqDist;
            var passedVisibilityCheck;
            var passesVisibilityCheck = function() {
              if (passedVisibilityCheck !== undefined) {
                return passedVisibilityCheck;
              }
              if (!visibleElementsOnly) {
                passedVisibilityCheck = true;
                return true;
              }
              var visible = edge.visible() && !edge.transparent();
              if (visible) {
                passedVisibilityCheck = true;
                return true;
              }
              passedVisibilityCheck = false;
              return false;
            };
            if (rs.edgeType === 'segments' || rs.edgeType === 'straight' || rs.edgeType === 'haystack') {
              var pts = rs.allpts;
              for (var i = 0; i + 3 < pts.length; i += 2) {
                if ((inEdgeBB = math.inLineVicinity(x, y, pts[i], pts[i + 1], pts[i + 2], pts[i + 3], width2)) && passesVisibilityCheck() && widthSq > (sqDist = math.sqDistanceToFiniteLine(x, y, pts[i], pts[i + 1], pts[i + 2], pts[i + 3]))) {
                  near.push(edge);
                }
              }
            } else if (rs.edgeType === 'bezier' || rs.edgeType === 'multibezier' || rs.edgeType === 'self' || rs.edgeType === 'compound') {
              var pts = rs.allpts;
              for (var i = 0; i + 5 < rs.allpts.length; i += 4) {
                if ((inEdgeBB = math.inBezierVicinity(x, y, pts[i], pts[i + 1], pts[i + 2], pts[i + 3], pts[i + 4], pts[i + 5], width2)) && passesVisibilityCheck() && (widthSq > (sqDist = math.sqDistanceToQuadraticBezier(x, y, pts[i], pts[i + 1], pts[i + 2], pts[i + 3], pts[i + 4], pts[i + 5])))) {
                  near.push(edge);
                }
              }
            }
            if (inEdgeBB && passesVisibilityCheck() && near.length === 0 || near[near.length - 1] !== edge) {
              var src = src || _p.source;
              var tgt = tgt || _p.target;
              var eWidth = style['width'].pfValue;
              var arSize = self.getArrowWidth(eWidth);
              var arrows = [{
                name: 'source',
                x: rs.arrowStartX,
                y: rs.arrowStartY,
                angle: rs.srcArrowAngle
              }, {
                name: 'target',
                x: rs.arrowEndX,
                y: rs.arrowEndY,
                angle: rs.tgtArrowAngle
              }, {
                name: 'mid-source',
                x: rs.midX,
                y: rs.midY,
                angle: rs.midsrcArrowAngle
              }, {
                name: 'mid-target',
                x: rs.midX,
                y: rs.midY,
                angle: rs.midtgtArrowAngle
              }];
              for (var i = 0; i < arrows.length; i++) {
                var ar = arrows[i];
                var shape = r.arrowShapes[style[ar.name + '-arrow-shape'].value];
                if (shape.roughCollide(x, y, arSize, ar.angle, {
                  x: ar.x,
                  y: ar.y
                }, edgeThreshold) && shape.collide(x, y, arSize, ar.angle, {
                  x: ar.x,
                  y: ar.y
                }, edgeThreshold)) {
                  near.push(edge);
                  break;
                }
              }
            }
            if (hasCompounds && near.length > 0 && near[near.length - 1] === edge) {
              checkNode(src);
              checkNode(tgt);
            }
          }
          function checkLabel(ele) {
            var _p = ele._private;
            var th = labelThreshold;
            if (_p.style['text-events'].strValue === 'no') {
              return;
            }
            if (_p.group === 'edges' && _p.style['edge-text-rotation'].strValue === 'autorotate') {
              var rstyle = _p.rstyle;
              var lw = rstyle.labelWidth + 2 * th;
              var lh = rstyle.labelHeight + 2 * th;
              var lx = rstyle.labelX;
              var ly = rstyle.labelY;
              var theta = _p.rscratch.labelAngle;
              var cos = Math.cos(theta);
              var sin = Math.sin(theta);
              var rotate = function(x, y) {
                x = x - lx;
                y = y - ly;
                return {
                  x: x * cos - y * sin + lx,
                  y: x * sin + y * cos + ly
                };
              };
              var lx1 = lx - lw / 2;
              var lx2 = lx + lw / 2;
              var ly1 = ly - lh / 2;
              var ly2 = ly + lh / 2;
              var px1y1 = rotate(lx1, ly1);
              var px1y2 = rotate(lx1, ly2);
              var px2y1 = rotate(lx2, ly1);
              var px2y2 = rotate(lx2, ly2);
              var points = [px1y1.x, px1y1.y, px2y1.x, px2y1.y, px2y2.x, px2y2.y, px1y2.x, px1y2.y];
              if (math.pointInsidePolygonPoints(x, y, points)) {
                near.push(ele);
              }
            } else {
              var bb = ele.boundingBox({
                includeLabels: true,
                includeNodes: false,
                includeEdges: false
              });
              bb.x1 -= th;
              bb.y1 -= th;
              bb.x2 += th;
              bb.y2 += th;
              bb.w = bb.x2 - bb.x1;
              bb.h = bb.y2 - bb.y1;
              if (math.inBoundingBox(bb, x, y)) {
                near.push(ele);
              }
            }
          }
          for (var i = eles.length - 1; i >= 0; i--) {
            var ele = eles[i];
            var _p = ele._private;
            if (near.length > 0) {
              break;
            }
            if (_p.group === 'nodes') {
              checkNode(ele);
            } else {
              checkEdge(ele);
            }
            checkLabel(ele);
          }
          if (near.length > 0) {
            return near[near.length - 1];
          } else {
            return null;
          }
        };
        BRp.getAllInBox = function(x1, y1, x2, y2) {
          var nodes = this.getCachedNodes();
          var edges = this.getCachedEdges();
          var box = [];
          var x1c = Math.min(x1, x2);
          var x2c = Math.max(x1, x2);
          var y1c = Math.min(y1, y2);
          var y2c = Math.max(y1, y2);
          x1 = x1c;
          x2 = x2c;
          y1 = y1c;
          y2 = y2c;
          var boxBb = math.makeBoundingBox({
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2
          });
          for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            var nodeBb = node.boundingBox({
              includeNodes: true,
              includeEdges: false,
              includeLabels: false
            });
            if (math.boundingBoxesIntersect(boxBb, nodeBb)) {
              box.push(nodes[i]);
            }
          }
          for (var e = 0; e < edges.length; e++) {
            var edge = edges[e];
            var _p = edge._private;
            var rs = _p.rscratch;
            if (rs.startX != null && rs.startY != null && !math.inBoundingBox(boxBb, rs.startX, rs.startY)) {
              continue;
            }
            if (rs.endX != null && rs.endY != null && !math.inBoundingBox(boxBb, rs.endX, rs.endY)) {
              continue;
            }
            if (rs.edgeType === 'bezier' || rs.edgeType === 'multibezier' || rs.edgeType === 'self' || rs.edgeType === 'compound' || rs.edgeType === 'segments' || rs.edgeType === 'haystack') {
              var pts = _p.rstyle.bezierPts || _p.rstyle.linePts || _p.rstyle.haystackPts;
              var allInside = true;
              for (var i = 0; i < pts.length; i++) {
                if (!math.pointInBoundingBox(boxBb, pts[i])) {
                  allInside = false;
                  break;
                }
              }
              if (allInside) {
                box.push(edge);
              }
            } else if (rs.edgeType === 'haystack' || rs.edgeType === 'straight') {
              box.push(edge);
            }
          }
          return box;
        };
        BRp.getNodeShape = function(node) {
          var r = this;
          var style = node._private.style;
          var shape = style['shape'].value;
          if (node.isParent()) {
            if (shape === 'rectangle' || shape === 'roundrectangle') {
              return shape;
            } else {
              return 'rectangle';
            }
          }
          if (shape === 'polygon') {
            var points = style['shape-polygon-points'].value;
            return r.nodeShapes.makePolygon(points).name;
          }
          return shape;
        };
        BRp.updateCachedZSortedEles = function() {
          this.getCachedZSortedEles(true);
        };
        BRp.getCachedZSortedEles = function(forceRecalc) {
          var lastNodes = this.lastZOrderCachedNodes;
          var lastEdges = this.lastZOrderCachedEdges;
          var nodes = this.getCachedNodes();
          var edges = this.getCachedEdges();
          var eles = [];
          if (forceRecalc || !lastNodes || !lastEdges || lastNodes !== nodes || lastEdges !== edges) {
            for (var i = 0; i < nodes.length; i++) {
              var n = nodes[i];
              if (n.animated() || (n.visible() && !n.transparent())) {
                eles.push(n);
              }
            }
            for (var i = 0; i < edges.length; i++) {
              var e = edges[i];
              if (e.animated() || (e.visible() && !e.transparent())) {
                eles.push(e);
              }
            }
            eles.sort(zIndexSort);
            this.cachedZSortedEles = eles;
          } else {
            eles = this.cachedZSortedEles;
          }
          this.lastZOrderCachedNodes = nodes;
          this.lastZOrderCachedEdges = edges;
          return eles;
        };
        function pushBezierPts(edge, pts) {
          var qbezierAt = function(p1, p2, p3, t) {
            return math.qbezierAt(p1, p2, p3, t);
          };
          var _p = edge._private;
          var bpts = _p.rstyle.bezierPts;
          bpts.push({
            x: qbezierAt(pts[0], pts[2], pts[4], 0.05),
            y: qbezierAt(pts[1], pts[3], pts[5], 0.05)
          });
          bpts.push({
            x: qbezierAt(pts[0], pts[2], pts[4], 0.25),
            y: qbezierAt(pts[1], pts[3], pts[5], 0.25)
          });
          bpts.push({
            x: qbezierAt(pts[0], pts[2], pts[4], 0.4),
            y: qbezierAt(pts[1], pts[3], pts[5], 0.4)
          });
          bpts.push({
            x: qbezierAt(pts[0], pts[2], pts[4], 0.5),
            y: qbezierAt(pts[1], pts[3], pts[5], 0.5)
          });
          bpts.push({
            x: qbezierAt(pts[0], pts[2], pts[4], 0.6),
            y: qbezierAt(pts[1], pts[3], pts[5], 0.6)
          });
          bpts.push({
            x: qbezierAt(pts[0], pts[2], pts[4], 0.75),
            y: qbezierAt(pts[1], pts[3], pts[5], 0.75)
          });
          bpts.push({
            x: qbezierAt(pts[0], pts[2], pts[4], 0.95),
            y: qbezierAt(pts[1], pts[3], pts[5], 0.95)
          });
        }
        BRp.projectLines = function(edge) {
          var _p = edge._private;
          var rs = _p.rscratch;
          var et = rs.edgeType;
          if (et === 'multibezier' || et === 'bezier' || et === 'self' || et === 'compound') {
            var bpts = _p.rstyle.bezierPts = [];
            for (var i = 0; i + 5 < rs.allpts.length; i += 4) {
              pushBezierPts(edge, rs.allpts.slice(i, i + 6));
            }
          } else if (et === 'segments') {
            var lpts = _p.rstyle.linePts = [];
            for (var i = 0; i + 1 < rs.allpts.length; i += 2) {
              lpts.push({
                x: rs.allpts[i],
                y: rs.allpts[i + 1]
              });
            }
          } else if (et === 'haystack') {
            var hpts = rs.haystackPts;
            _p.rstyle.haystackPts = [{
              x: hpts[0],
              y: hpts[1]
            }, {
              x: hpts[2],
              y: hpts[3]
            }];
          }
        };
        BRp.projectBezier = BRp.projectLines;
        BRp.recalculateNodeLabelProjection = function(node) {
          var content = node._private.style['label'].strValue;
          if (!content || content.match(/^\s+$/)) {
            return;
          }
          var textX,
              textY;
          var nodeWidth = node.outerWidth();
          var nodeHeight = node.outerHeight();
          var nodePos = node._private.position;
          var textHalign = node._private.style['text-halign'].strValue;
          var textValign = node._private.style['text-valign'].strValue;
          var rs = node._private.rscratch;
          var rstyle = node._private.rstyle;
          switch (textHalign) {
            case 'left':
              textX = nodePos.x - nodeWidth / 2;
              break;
            case 'right':
              textX = nodePos.x + nodeWidth / 2;
              break;
            default:
              textX = nodePos.x;
          }
          switch (textValign) {
            case 'top':
              textY = nodePos.y - nodeHeight / 2;
              break;
            case 'bottom':
              textY = nodePos.y + nodeHeight / 2;
              break;
            default:
              textY = nodePos.y;
          }
          rs.labelX = textX;
          rs.labelY = textY;
          rstyle.labelX = textX;
          rstyle.labelY = textY;
          this.applyLabelDimensions(node);
        };
        BRp.recalculateEdgeLabelProjection = function(edge) {
          var content = edge._private.style['label'].strValue;
          if (!content || content.match(/^\s+$/)) {
            return;
          }
          var textX,
              textY;
          var _p = edge._private;
          var rs = _p.rscratch;
          var rstyle = _p.rstyle;
          textX = rs.midX;
          textY = rs.midY;
          rs.labelX = textX;
          rs.labelY = textY;
          rstyle.labelX = textX;
          rstyle.labelY = textY;
          this.applyLabelDimensions(edge);
        };
        BRp.applyLabelDimensions = function(ele) {
          var rs = ele._private.rscratch;
          var rstyle = ele._private.rstyle;
          var text = this.getLabelText(ele);
          var labelDims = this.calculateLabelDimensions(ele, text);
          rstyle.labelWidth = labelDims.width;
          rs.labelWidth = labelDims.width;
          rstyle.labelHeight = labelDims.height;
          rs.labelHeight = labelDims.height;
        };
        BRp.getLabelText = function(ele) {
          var style = ele._private.style;
          var text = ele._private.style['label'].strValue;
          var textTransform = style['text-transform'].value;
          var rscratch = ele._private.rscratch;
          if (textTransform == 'none') {} else if (textTransform == 'uppercase') {
            text = text.toUpperCase();
          } else if (textTransform == 'lowercase') {
            text = text.toLowerCase();
          }
          if (style['text-wrap'].value === 'wrap') {
            if (rscratch.labelWrapKey && rscratch.labelWrapKey === rscratch.labelKey) {
              return rscratch.labelWrapCachedText;
            }
            var lines = text.split('\n');
            var maxW = style['text-max-width'].pfValue;
            var wrappedLines = [];
            for (var l = 0; l < lines.length; l++) {
              var line = lines[l];
              var lineDims = this.calculateLabelDimensions(ele, line, 'line=' + line);
              var lineW = lineDims.width;
              if (lineW > maxW) {
                var words = line.split(/\s+/);
                var subline = '';
                for (var w = 0; w < words.length; w++) {
                  var word = words[w];
                  var testLine = subline.length === 0 ? word : subline + ' ' + word;
                  var testDims = this.calculateLabelDimensions(ele, testLine, 'testLine=' + testLine);
                  var testW = testDims.width;
                  if (testW <= maxW) {
                    subline += word + ' ';
                  } else {
                    wrappedLines.push(subline);
                    subline = word + ' ';
                  }
                }
                if (!subline.match(/^\s+$/)) {
                  wrappedLines.push(subline);
                }
              } else {
                wrappedLines.push(line);
              }
            }
            rscratch.labelWrapCachedLines = wrappedLines;
            rscratch.labelWrapCachedText = text = wrappedLines.join('\n');
            rscratch.labelWrapKey = rscratch.labelKey;
          }
          return text;
        };
        BRp.calculateLabelDimensions = function(ele, text, extraKey) {
          var r = this;
          var style = ele._private.style;
          var fStyle = style['font-style'].strValue;
          var size = style['font-size'].pfValue + 'px';
          var family = style['font-family'].strValue;
          var weight = style['font-weight'].strValue;
          var cacheKey = ele._private.labelKey;
          if (extraKey) {
            cacheKey += '$@$' + extraKey;
          }
          var cache = r.labelDimCache || (r.labelDimCache = {});
          if (cache[cacheKey]) {
            return cache[cacheKey];
          }
          var div = this.labelCalcDiv;
          if (!div) {
            div = this.labelCalcDiv = document.createElement('div');
            document.body.appendChild(div);
          }
          var ds = div.style;
          ds.fontFamily = family;
          ds.fontStyle = fStyle;
          ds.fontSize = size;
          ds.fontWeight = weight;
          ds.position = 'absolute';
          ds.left = '-9999px';
          ds.top = '-9999px';
          ds.zIndex = '-1';
          ds.visibility = 'hidden';
          ds.pointerEvents = 'none';
          ds.padding = '0';
          ds.lineHeight = '1';
          if (style['text-wrap'].value === 'wrap') {
            ds.whiteSpace = 'pre';
          } else {
            ds.whiteSpace = 'normal';
          }
          div.textContent = text;
          cache[cacheKey] = {
            width: div.clientWidth,
            height: div.clientHeight
          };
          return cache[cacheKey];
        };
        BRp.recalculateRenderedStyle = function(eles) {
          var edges = [];
          var nodes = [];
          var handledEdge = {};
          for (var i = 0; i < eles.length; i++) {
            var ele = eles[i];
            var _p = ele._private;
            var style = _p.style;
            var rs = _p.rscratch;
            var rstyle = _p.rstyle;
            var id = _p.data.id;
            var bbStyleSame = rs.boundingBoxKey != null && _p.boundingBoxKey === rs.boundingBoxKey;
            var labelStyleSame = rs.labelKey != null && _p.labelKey === rs.labelKey;
            var styleSame = bbStyleSame && labelStyleSame;
            if (_p.group === 'nodes') {
              var pos = _p.position;
              var posSame = rstyle.nodeX != null && rstyle.nodeY != null && pos.x === rstyle.nodeX && pos.y === rstyle.nodeY;
              var wSame = rstyle.nodeW != null && rstyle.nodeW === style['width'].pfValue;
              var hSame = rstyle.nodeH != null && rstyle.nodeH === style['height'].pfValue;
              if (!posSame || !styleSame || !wSame || !hSame) {
                nodes.push(ele);
              }
              rstyle.nodeX = pos.x;
              rstyle.nodeY = pos.y;
              rstyle.nodeW = style['width'].pfValue;
              rstyle.nodeH = style['height'].pfValue;
            } else {
              var srcPos = _p.source._private.position;
              var tgtPos = _p.target._private.position;
              var srcSame = rstyle.srcX != null && rstyle.srcY != null && srcPos.x === rstyle.srcX && srcPos.y === rstyle.srcY;
              var tgtSame = rstyle.tgtX != null && rstyle.tgtY != null && tgtPos.x === rstyle.tgtX && tgtPos.y === rstyle.tgtY;
              var positionsSame = srcSame && tgtSame;
              if (!positionsSame || !styleSame) {
                if (rs.edgeType === 'bezier' || rs.edgeType === 'straight' || rs.edgeType === 'self' || rs.edgeType === 'compound') {
                  if (!handledEdge[id]) {
                    edges.push(ele);
                    handledEdge[id] = true;
                    var parallelEdges = ele.parallelEdges();
                    for (var i = 0; i < parallelEdges.length; i++) {
                      var pEdge = parallelEdges[i];
                      var pId = pEdge._private.data.id;
                      if (!handledEdge[pId]) {
                        edges.push(pEdge);
                        handledEdge[pId] = true;
                      }
                    }
                  }
                } else {
                  edges.push(ele);
                }
              }
              rstyle.srcX = srcPos.x;
              rstyle.srcY = srcPos.y;
              rstyle.tgtX = tgtPos.x;
              rstyle.tgtY = tgtPos.y;
            }
            rs.boundingBoxKey = _p.boundingBoxKey;
            rs.labelKey = _p.labelKey;
          }
          this.recalculateEdgeProjections(edges);
          this.recalculateLabelProjections(nodes, edges);
        };
        BRp.recalculateLabelProjections = function(nodes, edges) {
          for (var i = 0; i < nodes.length; i++) {
            this.recalculateNodeLabelProjection(nodes[i]);
          }
          for (var i = 0; i < edges.length; i++) {
            this.recalculateEdgeLabelProjection(edges[i]);
          }
        };
        BRp.recalculateEdgeProjections = function(edges) {
          this.findEdgeControlPoints(edges);
        };
        BRp.findEdgeControlPoints = function(edges) {
          if (!edges || edges.length === 0) {
            return;
          }
          var r = this;
          var cy = r.cy;
          var hasCompounds = cy.hasCompoundNodes();
          var hashTable = {};
          var pairIds = [];
          var haystackEdges = [];
          var autorotateEdges = [];
          var pairId;
          for (var i = 0; i < edges.length; i++) {
            var edge = edges[i];
            var _p = edge._private;
            var data = _p.data;
            var style = _p.style;
            var curveStyle = style['curve-style'].value;
            var edgeIsUnbundled = curveStyle === 'unbundled-bezier' || curveStyle === 'segments';
            if (style.display.value === 'none') {
              continue;
            }
            if (style['edge-text-rotation'].strValue === 'autorotate') {
              autorotateEdges.push(edge);
            }
            if (curveStyle === 'haystack') {
              haystackEdges.push(edge);
              continue;
            }
            var srcId = data.source;
            var tgtId = data.target;
            pairId = srcId > tgtId ? tgtId + '$-$' + srcId : srcId + '$-$' + tgtId;
            if (edgeIsUnbundled) {
              pairId = 'unbundled' + '$-$' + data.id;
            }
            if (hashTable[pairId] == null) {
              hashTable[pairId] = [];
              pairIds.push(pairId);
            }
            hashTable[pairId].push(edge);
            if (edgeIsUnbundled) {
              hashTable[pairId].hasUnbundled = true;
            }
          }
          var src,
              tgt,
              src_p,
              tgt_p,
              srcPos,
              tgtPos,
              srcW,
              srcH,
              tgtW,
              tgtH,
              srcShape,
              tgtShape;
          var vectorNormInverse;
          var badBezier;
          for (var p = 0; p < pairIds.length; p++) {
            pairId = pairIds[p];
            var pairEdges = hashTable[pairId];
            pairEdges.sort(function(edge1, edge2) {
              return edge1._private.index - edge2._private.index;
            });
            src = pairEdges[0]._private.source;
            tgt = pairEdges[0]._private.target;
            src_p = src._private;
            tgt_p = tgt._private;
            if (src_p.data.id > tgt_p.data.id) {
              var temp = src;
              src = tgt;
              tgt = temp;
            }
            srcPos = src_p.position;
            tgtPos = tgt_p.position;
            srcW = src.outerWidth();
            srcH = src.outerHeight();
            tgtW = tgt.outerWidth();
            tgtH = tgt.outerHeight();
            srcShape = r.nodeShapes[this.getNodeShape(src)];
            tgtShape = r.nodeShapes[this.getNodeShape(tgt)];
            badBezier = false;
            if ((pairEdges.length > 1 && src !== tgt) || pairEdges.hasUnbundled) {
              var srcOutside = srcShape.intersectLine(srcPos.x, srcPos.y, srcW, srcH, tgtPos.x, tgtPos.y, 0);
              var tgtOutside = tgtShape.intersectLine(tgtPos.x, tgtPos.y, tgtW, tgtH, srcPos.x, srcPos.y, 0);
              var midptSrcPts = {
                x1: srcOutside[0],
                x2: tgtOutside[0],
                y1: srcOutside[1],
                y2: tgtOutside[1]
              };
              var dy = (tgtOutside[1] - srcOutside[1]);
              var dx = (tgtOutside[0] - srcOutside[0]);
              var l = Math.sqrt(dx * dx + dy * dy);
              var vector = {
                x: dx,
                y: dy
              };
              var vectorNorm = {
                x: vector.x / l,
                y: vector.y / l
              };
              vectorNormInverse = {
                x: -vectorNorm.y,
                y: vectorNorm.x
              };
              if (tgtShape.checkPoint(srcOutside[0], srcOutside[1], 0, tgtW, tgtH, tgtPos.x, tgtPos.y) || srcShape.checkPoint(tgtOutside[0], tgtOutside[1], 0, srcW, srcH, srcPos.x, srcPos.y)) {
                vectorNormInverse = {};
                badBezier = true;
              }
            }
            var edge;
            var edge_p;
            var rs;
            for (var i = 0; i < pairEdges.length; i++) {
              edge = pairEdges[i];
              edge_p = edge._private;
              rs = edge_p.rscratch;
              var edgeIndex1 = rs.lastEdgeIndex;
              var edgeIndex2 = i;
              var numEdges1 = rs.lastNumEdges;
              var numEdges2 = pairEdges.length;
              var eStyle = edge_p.style;
              var style = eStyle;
              var curveStyle = eStyle['curve-style'].value;
              var ctrlptDists = eStyle['control-point-distances'];
              var ctrlptWs = eStyle['control-point-weights'];
              var bezierN = ctrlptDists && ctrlptWs ? Math.min(ctrlptDists.value.length, ctrlptWs.value.length) : 1;
              var stepSize = eStyle['control-point-step-size'].pfValue;
              var ctrlptDist = ctrlptDists !== undefined ? ctrlptDists.pfValue[0] : undefined;
              var ctrlptWeight = ctrlptWs.value[0];
              var edgeIsUnbundled = curveStyle === 'unbundled-bezier' || curveStyle === 'segments';
              var swappedDirection = edge_p.source !== src;
              if (swappedDirection && edgeIsUnbundled) {
                ctrlptDist *= -1;
              }
              var srcX1 = rs.lastSrcCtlPtX;
              var srcX2 = srcPos.x;
              var srcY1 = rs.lastSrcCtlPtY;
              var srcY2 = srcPos.y;
              var srcW1 = rs.lastSrcCtlPtW;
              var srcW2 = src.outerWidth();
              var srcH1 = rs.lastSrcCtlPtH;
              var srcH2 = src.outerHeight();
              var tgtX1 = rs.lastTgtCtlPtX;
              var tgtX2 = tgtPos.x;
              var tgtY1 = rs.lastTgtCtlPtY;
              var tgtY2 = tgtPos.y;
              var tgtW1 = rs.lastTgtCtlPtW;
              var tgtW2 = tgt.outerWidth();
              var tgtH1 = rs.lastTgtCtlPtH;
              var tgtH2 = tgt.outerHeight();
              var width1 = rs.lastW;
              var width2 = eStyle['control-point-step-size'].pfValue;
              if (badBezier) {
                rs.badBezier = true;
              } else {
                rs.badBezier = false;
              }
              if (srcX1 === srcX2 && srcY1 === srcY2 && srcW1 === srcW2 && srcH1 === srcH2 && tgtX1 === tgtX2 && tgtY1 === tgtY2 && tgtW1 === tgtW2 && tgtH1 === tgtH2 && width1 === width2 && ((edgeIndex1 === edgeIndex2 && numEdges1 === numEdges2) || edgeIsUnbundled)) {
                continue;
              } else {
                rs.lastSrcCtlPtX = srcX2;
                rs.lastSrcCtlPtY = srcY2;
                rs.lastSrcCtlPtW = srcW2;
                rs.lastSrcCtlPtH = srcH2;
                rs.lastTgtCtlPtX = tgtX2;
                rs.lastTgtCtlPtY = tgtY2;
                rs.lastTgtCtlPtW = tgtW2;
                rs.lastTgtCtlPtH = tgtH2;
                rs.lastEdgeIndex = edgeIndex2;
                rs.lastNumEdges = numEdges2;
                rs.lastWidth = width2;
              }
              if (src === tgt) {
                rs.edgeType = 'self';
                var j = i;
                var loopDist = stepSize;
                if (edgeIsUnbundled) {
                  j = 0;
                  loopDist = ctrlptDist;
                }
                rs.ctrlpts = [srcPos.x, srcPos.y - (1 + Math.pow(srcH, 1.12) / 100) * loopDist * (j / 3 + 1), srcPos.x - (1 + Math.pow(srcW, 1.12) / 100) * loopDist * (j / 3 + 1), srcPos.y];
              } else if (hasCompounds && (src.isParent() || src.isChild() || tgt.isParent() || tgt.isChild()) && (src.parents().anySame(tgt) || tgt.parents().anySame(src))) {
                rs.edgeType = 'compound';
                rs.badBezier = false;
                var j = i;
                var loopDist = stepSize;
                if (edgeIsUnbundled) {
                  j = 0;
                  loopDist = ctrlptDist;
                }
                var loopW = 50;
                var loopaPos = {
                  x: srcPos.x - srcW / 2,
                  y: srcPos.y - srcH / 2
                };
                var loopbPos = {
                  x: tgtPos.x - tgtW / 2,
                  y: tgtPos.y - tgtH / 2
                };
                var loopPos = {
                  x: Math.min(loopaPos.x, loopbPos.x),
                  y: Math.min(loopaPos.y, loopbPos.y)
                };
                var minCompoundStretch = 0.5;
                var compoundStretchA = Math.max(minCompoundStretch, Math.log(srcW * 0.01));
                var compoundStretchB = Math.max(minCompoundStretch, Math.log(tgtW * 0.01));
                rs.ctrlpts = [loopPos.x, loopPos.y - (1 + Math.pow(loopW, 1.12) / 100) * loopDist * (j / 3 + 1) * compoundStretchA, loopPos.x - (1 + Math.pow(loopW, 1.12) / 100) * loopDist * (j / 3 + 1) * compoundStretchB, loopPos.y];
              } else if (curveStyle === 'segments') {
                rs.edgeType = 'segments';
                rs.segpts = [];
                var segmentWs = eStyle['segment-weights'].pfValue;
                var segmentDs = eStyle['segment-distances'].pfValue;
                var segmentsN = Math.min(segmentWs.length, segmentDs.length);
                for (var s = 0; s < segmentsN; s++) {
                  var w = segmentWs[s];
                  var d = segmentDs[s];
                  var w1 = (1 - w);
                  var w2 = w;
                  var adjustedMidpt = {
                    x: midptSrcPts.x1 * w1 + midptSrcPts.x2 * w2,
                    y: midptSrcPts.y1 * w1 + midptSrcPts.y2 * w2
                  };
                  rs.segpts.push(adjustedMidpt.x + vectorNormInverse.x * d, adjustedMidpt.y + vectorNormInverse.y * d);
                }
              } else if (pairEdges.length % 2 === 1 && i === Math.floor(pairEdges.length / 2) && !edgeIsUnbundled) {
                rs.edgeType = 'straight';
              } else {
                var multi = edgeIsUnbundled;
                rs.edgeType = multi ? 'multibezier' : 'bezier';
                rs.ctrlpts = [];
                for (var b = 0; b < bezierN; b++) {
                  var normctrlptDist = (0.5 - pairEdges.length / 2 + i) * stepSize;
                  var manctrlptDist;
                  var sign = math.signum(normctrlptDist);
                  if (multi) {
                    ctrlptDist = ctrlptDists ? ctrlptDists.pfValue[b] : stepSize;
                    ctrlptWeight = ctrlptWs.value[b];
                  }
                  if (edgeIsUnbundled) {
                    manctrlptDist = ctrlptDist;
                  } else {
                    manctrlptDist = ctrlptDist !== undefined ? sign * ctrlptDist : undefined;
                  }
                  var distanceFromMidpoint = manctrlptDist !== undefined ? manctrlptDist : normctrlptDist;
                  var w1 = !swappedDirection || edgeIsUnbundled ? (1 - ctrlptWeight) : ctrlptWeight;
                  var w2 = !swappedDirection || edgeIsUnbundled ? ctrlptWeight : (1 - ctrlptWeight);
                  var adjustedMidpt = {
                    x: midptSrcPts.x1 * w1 + midptSrcPts.x2 * w2,
                    y: midptSrcPts.y1 * w1 + midptSrcPts.y2 * w2
                  };
                  rs.ctrlpts.push(adjustedMidpt.x + vectorNormInverse.x * distanceFromMidpoint, adjustedMidpt.y + vectorNormInverse.y * distanceFromMidpoint);
                }
              }
              this.findEndpoints(edge);
              var badStart = !is.number(rs.startX) || !is.number(rs.startY);
              var badAStart = !is.number(rs.arrowStartX) || !is.number(rs.arrowStartY);
              var badEnd = !is.number(rs.endX) || !is.number(rs.endY);
              var badAEnd = !is.number(rs.arrowEndX) || !is.number(rs.arrowEndY);
              var minCpADistFactor = 3;
              var arrowW = this.getArrowWidth(eStyle['width'].pfValue) * this.arrowShapeHeight;
              var minCpADist = minCpADistFactor * arrowW;
              if (rs.edgeType === 'bezier') {
                var startACpDist = math.distance({
                  x: rs.ctrlpts[0],
                  y: rs.ctrlpts[1]
                }, {
                  x: rs.startX,
                  y: rs.startY
                });
                var closeStartACp = startACpDist < minCpADist;
                var endACpDist = math.distance({
                  x: rs.ctrlpts[0],
                  y: rs.ctrlpts[1]
                }, {
                  x: rs.endX,
                  y: rs.endY
                });
                var closeEndACp = endACpDist < minCpADist;
                var overlapping = false;
                if (badStart || badAStart || closeStartACp) {
                  overlapping = true;
                  var cpD = {
                    x: rs.ctrlpts[0] - srcPos.x,
                    y: rs.ctrlpts[1] - srcPos.y
                  };
                  var cpL = Math.sqrt(cpD.x * cpD.x + cpD.y * cpD.y);
                  var cpM = {
                    x: cpD.x / cpL,
                    y: cpD.y / cpL
                  };
                  var radius = Math.max(srcW, srcH);
                  var cpProj = {
                    x: rs.ctrlpts[0] + cpM.x * 2 * radius,
                    y: rs.ctrlpts[1] + cpM.y * 2 * radius
                  };
                  var srcCtrlPtIntn = srcShape.intersectLine(srcPos.x, srcPos.y, srcW, srcH, cpProj.x, cpProj.y, 0);
                  if (closeStartACp) {
                    rs.ctrlpts[0] = rs.ctrlpts[0] + cpM.x * (minCpADist - startACpDist);
                    rs.ctrlpts[1] = rs.ctrlpts[1] + cpM.y * (minCpADist - startACpDist);
                  } else {
                    rs.ctrlpts[0] = srcCtrlPtIntn[0] + cpM.x * minCpADist;
                    rs.ctrlpts[1] = srcCtrlPtIntn[1] + cpM.y * minCpADist;
                  }
                }
                if (badEnd || badAEnd || closeEndACp) {
                  overlapping = true;
                  var cpD = {
                    x: rs.ctrlpts[0] - tgtPos.x,
                    y: rs.ctrlpts[1] - tgtPos.y
                  };
                  var cpL = Math.sqrt(cpD.x * cpD.x + cpD.y * cpD.y);
                  var cpM = {
                    x: cpD.x / cpL,
                    y: cpD.y / cpL
                  };
                  var radius = Math.max(srcW, srcH);
                  var cpProj = {
                    x: rs.ctrlpts[0] + cpM.x * 2 * radius,
                    y: rs.ctrlpts[1] + cpM.y * 2 * radius
                  };
                  var tgtCtrlPtIntn = tgtShape.intersectLine(tgtPos.x, tgtPos.y, tgtW, tgtH, cpProj.x, cpProj.y, 0);
                  if (closeEndACp) {
                    rs.ctrlpts[0] = rs.ctrlpts[0] + cpM.x * (minCpADist - endACpDist);
                    rs.ctrlpts[1] = rs.ctrlpts[1] + cpM.y * (minCpADist - endACpDist);
                  } else {
                    rs.ctrlpts[0] = tgtCtrlPtIntn[0] + cpM.x * minCpADist;
                    rs.ctrlpts[1] = tgtCtrlPtIntn[1] + cpM.y * minCpADist;
                  }
                }
                if (overlapping) {
                  this.findEndpoints(edge);
                }
              }
              if (rs.edgeType === 'multibezier' || rs.edgeType === 'bezier' || rs.edgeType === 'self' || rs.edgeType === 'compound') {
                rs.allpts = [];
                rs.allpts.push(rs.startX, rs.startY);
                for (var b = 0; b + 1 < rs.ctrlpts.length; b += 2) {
                  rs.allpts.push(rs.ctrlpts[b], rs.ctrlpts[b + 1]);
                  if (b + 3 < rs.ctrlpts.length) {
                    rs.allpts.push((rs.ctrlpts[b] + rs.ctrlpts[b + 2]) / 2, (rs.ctrlpts[b + 1] + rs.ctrlpts[b + 3]) / 2);
                  }
                }
                rs.allpts.push(rs.endX, rs.endY);
                var m,
                    mt;
                if (rs.edgeType === 'bezier') {
                  rs.midX = math.qbezierAt(rs.arrowStartX, rs.ctrlpts[0], rs.arrowEndX, 0.5);
                  rs.midY = math.qbezierAt(rs.arrowStartY, rs.ctrlpts[1], rs.arrowEndY, 0.5);
                } else if (rs.ctrlpts.length / 2 % 2 === 0) {
                  m = rs.allpts.length / 2 - 1;
                  rs.midX = rs.allpts[m];
                  rs.midY = rs.allpts[m + 1];
                } else {
                  m = rs.allpts.length / 2 - 3;
                  mt = 0.5;
                  rs.midX = math.qbezierAt(rs.allpts[m], rs.allpts[m + 2], rs.allpts[m + 4], mt);
                  rs.midY = math.qbezierAt(rs.allpts[m + 1], rs.allpts[m + 3], rs.allpts[m + 5], mt);
                }
              } else if (rs.edgeType === 'straight') {
                rs.allpts = [rs.startX, rs.startY, rs.endX, rs.endY];
                rs.midX = (rs.arrowStartX + rs.arrowEndX) / 2;
                rs.midY = (rs.arrowStartY + rs.arrowEndY) / 2;
              } else if (rs.edgeType === 'segments') {
                rs.allpts = [];
                rs.allpts.push(rs.startX, rs.startY);
                rs.allpts.push.apply(rs.allpts, rs.segpts);
                rs.allpts.push(rs.endX, rs.endY);
                if (rs.segpts.length % 4 === 0) {
                  var i2 = rs.segpts.length / 2;
                  var i1 = i2 - 2;
                  rs.midX = (rs.segpts[i1] + rs.segpts[i2]) / 2;
                  rs.midY = (rs.segpts[i1 + 1] + rs.segpts[i2 + 1]) / 2;
                } else {
                  var i1 = rs.segpts.length / 2 - 1;
                  rs.midX = rs.segpts[i1];
                  rs.midY = rs.segpts[i1 + 1];
                }
              }
              this.projectLines(edge);
              this.calculateArrowAngles(edge);
              this.recalculateEdgeLabelProjection(edge);
            }
          }
          for (var i = 0; i < haystackEdges.length; i++) {
            var edge = haystackEdges[i];
            var _p = edge._private;
            var style = _p.style;
            var rscratch = _p.rscratch;
            var rs = rscratch;
            if (!rscratch.haystack) {
              var angle = Math.random() * 2 * Math.PI;
              rscratch.source = {
                x: Math.cos(angle),
                y: Math.sin(angle)
              };
              var angle = Math.random() * 2 * Math.PI;
              rscratch.target = {
                x: Math.cos(angle),
                y: Math.sin(angle)
              };
            }
            var src = _p.source;
            var tgt = _p.target;
            var srcPos = src._private.position;
            var tgtPos = tgt._private.position;
            var srcW = src.width();
            var tgtW = tgt.width();
            var srcH = src.height();
            var tgtH = tgt.height();
            var radius = style['haystack-radius'].value;
            var halfRadius = radius / 2;
            rs.haystackPts = rs.allpts = [rs.source.x * srcW * halfRadius + srcPos.x, rs.source.y * srcH * halfRadius + srcPos.y, rs.target.x * tgtW * halfRadius + tgtPos.x, rs.target.y * tgtH * halfRadius + tgtPos.y];
            rs.midX = (rs.allpts[0] + rs.allpts[2]) / 2;
            rs.midY = (rs.allpts[1] + rs.allpts[3]) / 2;
            rscratch.edgeType = 'haystack';
            rscratch.haystack = true;
            this.projectLines(edge);
            this.calculateArrowAngles(edge);
            this.recalculateEdgeLabelProjection(edge);
          }
          for (var i = 0; i < autorotateEdges.length; i++) {
            var edge = autorotateEdges[i];
            var rs = edge._private.rscratch;
            rs.labelAngle = Math.atan(rs.midDispY / rs.midDispX);
          }
          return hashTable;
        };
        var getAngleFromDisp = function(dispX, dispY) {
          return Math.atan2(dispY, dispX) - Math.PI / 2;
        };
        BRp.calculateArrowAngles = function(edge) {
          var rs = edge._private.rscratch;
          var isHaystack = rs.edgeType === 'haystack';
          var isMultibezier = rs.edgeType === 'multibezier';
          var isSegments = rs.edgeType === 'segments';
          var isCompound = rs.edgeType === 'compound';
          var isSelf = rs.edgeType === 'self';
          var dispX,
              dispY;
          var startX,
              startY,
              endX,
              endY;
          var srcPos = edge.source().position();
          var tgtPos = edge.target().position();
          if (isHaystack) {
            startX = rs.haystackPts[0];
            startY = rs.haystackPts[1];
            endX = rs.haystackPts[2];
            endY = rs.haystackPts[3];
          } else {
            startX = rs.arrowStartX;
            startY = rs.arrowStartY;
            endX = rs.arrowEndX;
            endY = rs.arrowEndY;
          }
          dispX = srcPos.x - startX;
          dispY = srcPos.y - startY;
          rs.srcArrowAngle = getAngleFromDisp(dispX, dispY);
          var midX = rs.midX;
          var midY = rs.midY;
          if (isHaystack) {
            midX = (startX + endX) / 2;
            midY = (startY + endY) / 2;
          }
          dispX = endX - startX;
          dispY = endY - startY;
          if (isSelf) {
            dispX = -1;
            dispY = 1;
          } else if (isSegments) {
            var pts = rs.allpts;
            if (pts.length / 2 % 2 === 0) {
              var i2 = pts.length / 2;
              var i1 = i2 - 2;
              dispX = (pts[i2] - pts[i1]);
              dispY = (pts[i2 + 1] - pts[i1 + 1]);
            } else {
              var i2 = pts.length / 2 - 1;
              var i1 = i2 - 2;
              var i3 = i2 + 2;
              dispX = (pts[i2] - pts[i1]);
              dispY = (pts[i2 + 1] - pts[i1 + 1]);
            }
          } else if (isMultibezier || isCompound) {
            var pts = rs.allpts;
            var cpts = rs.ctrlpts;
            var bp0x,
                bp0y;
            var bp1x,
                bp1y;
            if (cpts.length / 2 % 2 === 0) {
              var p0 = pts.length / 2 - 1;
              var ic = p0 + 2;
              var p1 = ic + 2;
              bp0x = math.qbezierAt(pts[p0], pts[ic], pts[p1], 0.0);
              bp0y = math.qbezierAt(pts[p0 + 1], pts[ic + 1], pts[p1 + 1], 0.0);
              bp1x = math.qbezierAt(pts[p0], pts[ic], pts[p1], 0.0001);
              bp1y = math.qbezierAt(pts[p0 + 1], pts[ic + 1], pts[p1 + 1], 0.0001);
            } else {
              var ic = pts.length / 2 - 1;
              var p0 = ic - 2;
              var p1 = ic + 2;
              bp0x = math.qbezierAt(pts[p0], pts[ic], pts[p1], 0.4999);
              bp0y = math.qbezierAt(pts[p0 + 1], pts[ic + 1], pts[p1 + 1], 0.4999);
              bp1x = math.qbezierAt(pts[p0], pts[ic], pts[p1], 0.5);
              bp1y = math.qbezierAt(pts[p0 + 1], pts[ic + 1], pts[p1 + 1], 0.5);
            }
            dispX = (bp1x - bp0x);
            dispY = (bp1y - bp0y);
          }
          rs.midtgtArrowAngle = getAngleFromDisp(dispX, dispY);
          rs.midDispX = dispX;
          rs.midDispY = dispY;
          dispX *= -1;
          dispY *= -1;
          if (isSegments) {
            var pts = rs.allpts;
            if (pts.length / 2 % 2 === 0) {} else {
              var i2 = pts.length / 2 - 1;
              var i3 = i2 + 2;
              dispX = -(pts[i3] - pts[i2]);
              dispY = -(pts[i3 + 1] - pts[i2 + 1]);
            }
          }
          rs.midsrcArrowAngle = getAngleFromDisp(dispX, dispY);
          dispX = tgtPos.x - endX;
          dispY = tgtPos.y - endY;
          rs.tgtArrowAngle = getAngleFromDisp(dispX, dispY);
        };
        BRp.findEndpoints = function(edge) {
          var r = this;
          var intersect;
          var source = edge.source()[0];
          var target = edge.target()[0];
          var src_p = source._private;
          var tgt_p = target._private;
          var srcPos = src_p.position;
          var tgtPos = tgt_p.position;
          var tgtArShape = edge._private.style['target-arrow-shape'].value;
          var srcArShape = edge._private.style['source-arrow-shape'].value;
          var rs = edge._private.rscratch;
          var et = rs.edgeType;
          var bezier = et === 'bezier' || et === 'multibezier' || et === 'self' || et === 'compound';
          var multi = et !== 'bezier';
          var lines = et === 'straight' || et === 'segments';
          var segments = et === 'segments';
          var p1,
              p2;
          if (bezier) {
            var cpStart = [rs.ctrlpts[0], rs.ctrlpts[1]];
            var cpEnd = multi ? [rs.ctrlpts[rs.ctrlpts.length - 2], rs.ctrlpts[rs.ctrlpts.length - 1]] : cpStart;
            p1 = cpEnd;
            p2 = cpStart;
          } else if (lines) {
            var srcArrowFromPt = !segments ? [tgtPos.x, tgtPos.y] : rs.segpts.slice(0, 2);
            var tgtArrowFromPt = !segments ? [srcPos.x, srcPos.y] : rs.segpts.slice(rs.segpts.length - 2);
            p1 = tgtArrowFromPt;
            p2 = srcArrowFromPt;
          }
          intersect = r.nodeShapes[this.getNodeShape(target)].intersectLine(tgtPos.x, tgtPos.y, target.outerWidth(), target.outerHeight(), p1[0], p1[1], 0);
          var arrowEnd = math.shortenIntersection(intersect, p1, r.arrowShapes[tgtArShape].spacing(edge));
          var edgeEnd = math.shortenIntersection(intersect, p1, r.arrowShapes[tgtArShape].gap(edge));
          rs.endX = edgeEnd[0];
          rs.endY = edgeEnd[1];
          rs.arrowEndX = arrowEnd[0];
          rs.arrowEndY = arrowEnd[1];
          intersect = r.nodeShapes[this.getNodeShape(source)].intersectLine(srcPos.x, srcPos.y, source.outerWidth(), source.outerHeight(), p2[0], p2[1], 0);
          var arrowStart = math.shortenIntersection(intersect, p2, r.arrowShapes[srcArShape].spacing(edge));
          var edgeStart = math.shortenIntersection(intersect, p2, r.arrowShapes[srcArShape].gap(edge));
          rs.startX = edgeStart[0];
          rs.startY = edgeStart[1];
          rs.arrowStartX = arrowStart[0];
          rs.arrowStartY = arrowStart[1];
          if (lines) {
            if (!is.number(rs.startX) || !is.number(rs.startY) || !is.number(rs.endX) || !is.number(rs.endY)) {
              rs.badLine = true;
            } else {
              rs.badLine = false;
            }
          }
        };
        BRp.getArrowWidth = BRp.getArrowHeight = function(edgeWidth) {
          var cache = this.arrowWidthCache = this.arrowWidthCache || {};
          var cachedVal = cache[edgeWidth];
          if (cachedVal) {
            return cachedVal;
          }
          cachedVal = Math.max(Math.pow(edgeWidth * 13.37, 0.9), 29);
          cache[edgeWidth] = cachedVal;
          return cachedVal;
        };
        module.exports = BRp;
      }, {
        "../../../collection/zsort": 29,
        "../../../is": 77,
        "../../../math": 79
      }],
      57: [function(_dereq_, module, exports) {
        'use strict';
        var BRp = {};
        BRp.getCachedImage = function(url, onLoad) {
          var r = this;
          var imageCache = r.imageCache = r.imageCache || {};
          if (imageCache[url] && imageCache[url].image) {
            return imageCache[url].image;
          }
          var cache = imageCache[url] = imageCache[url] || {};
          var image = cache.image = new Image();
          image.addEventListener('load', onLoad);
          image.src = url;
          return image;
        };
        module.exports = BRp;
      }, {}],
      58: [function(_dereq_, module, exports) {
        'use strict';
        var is = _dereq_('../../../is');
        var util = _dereq_('../../../util');
        var BaseRenderer = function() {};
        var BR = BaseRenderer;
        var BRp = BR.prototype;
        BRp.clientFunctions = ['redrawHint', 'render', 'renderTo', 'matchCanvasSize', 'nodeShapeImpl', 'arrowShapeImpl'];
        BRp.init = function(options) {
          var r = this;
          r.options = options;
          r.cy = options.cy;
          r.container = options.cy.container();
          r.selection = [undefined, undefined, undefined, undefined, 0];
          r.hoverData = {
            down: null,
            last: null,
            downTime: null,
            triggerMode: null,
            dragging: false,
            initialPan: [null, null],
            capture: false
          };
          r.dragData = {possibleDragElements: []};
          r.touchData = {
            start: null,
            capture: false,
            startPosition: [null, null, null, null, null, null],
            singleTouchStartTime: null,
            singleTouchMoved: true,
            now: [null, null, null, null, null, null],
            earlier: [null, null, null, null, null, null]
          };
          r.redraws = 0;
          r.showFps = options.showFps;
          r.hideEdgesOnViewport = options.hideEdgesOnViewport;
          r.hideLabelsOnViewport = options.hideLabelsOnViewport;
          r.textureOnViewport = options.textureOnViewport;
          r.wheelSensitivity = options.wheelSensitivity;
          r.motionBlurEnabled = options.motionBlur;
          r.forcedPixelRatio = options.pixelRatio;
          r.motionBlur = true;
          r.motionBlurOpacity = options.motionBlurOpacity;
          r.motionBlurTransparency = 1 - r.motionBlurOpacity;
          r.motionBlurPxRatio = 1;
          r.mbPxRBlurry = 1;
          r.minMbLowQualFrames = 4;
          r.fullQualityMb = false;
          r.clearedForMotionBlur = [];
          r.desktopTapThreshold = options.desktopTapThreshold;
          r.desktopTapThreshold2 = options.desktopTapThreshold * options.desktopTapThreshold;
          r.touchTapThreshold = options.touchTapThreshold;
          r.touchTapThreshold2 = options.touchTapThreshold * options.touchTapThreshold;
          r.tapholdDuration = 500;
          r.bindings = [];
          r.registerNodeShapes();
          r.registerArrowShapes();
          r.load();
        };
        BRp.notify = function(params) {
          var types;
          var r = this;
          if (is.array(params.type)) {
            types = params.type;
          } else {
            types = [params.type];
          }
          for (var i = 0; i < types.length; i++) {
            var type = types[i];
            switch (type) {
              case 'destroy':
                r.destroy();
                return;
              case 'add':
              case 'remove':
              case 'load':
                r.updateElementsCache();
                break;
              case 'viewport':
                r.redrawHint('select', true);
                break;
              case 'style':
                r.updateCachedZSortedEles();
                break;
            }
            if (type === 'load' || type === 'resize') {
              r.invalidateContainerClientCoordsCache();
              r.matchCanvasSize(r.container);
            }
          }
          r.redrawHint('eles', true);
          r.redrawHint('drag', true);
          this.startRenderLoop();
          this.redraw();
        };
        BRp.destroy = function() {
          this.destroyed = true;
          this.cy.stopAnimationLoop();
          for (var i = 0; i < this.bindings.length; i++) {
            var binding = this.bindings[i];
            var b = binding;
            b.target.removeEventListener(b.event, b.handler, b.useCapture);
          }
          if (this.removeObserver) {
            this.removeObserver.disconnect();
          }
          if (this.labelCalcDiv) {
            try {
              document.body.removeChild(this.labelCalcDiv);
            } catch (e) {}
          }
        };
        [_dereq_('./arrow-shapes'), _dereq_('./cached-eles'), _dereq_('./coord-ele-math'), _dereq_('./images'), _dereq_('./load-listeners'), _dereq_('./node-shapes'), _dereq_('./redraw')].forEach(function(props) {
          util.extend(BRp, props);
        });
        module.exports = BR;
      }, {
        "../../../is": 77,
        "../../../util": 94,
        "./arrow-shapes": 54,
        "./cached-eles": 55,
        "./coord-ele-math": 56,
        "./images": 57,
        "./load-listeners": 59,
        "./node-shapes": 60,
        "./redraw": 61
      }],
      59: [function(_dereq_, module, exports) {
        'use strict';
        var is = _dereq_('../../../is');
        var util = _dereq_('../../../util');
        var Event = _dereq_('../../../event');
        var Collection = _dereq_('../../../collection');
        var BRp = {};
        BRp.registerBinding = function(target, event, handler, useCapture) {
          this.bindings.push({
            target: target,
            event: event,
            handler: handler,
            useCapture: useCapture
          });
          target.addEventListener(event, handler, useCapture);
        };
        BRp.nodeIsDraggable = function(node) {
          if (node._private.style['opacity'].value !== 0 && node._private.style['visibility'].value == 'visible' && node._private.style['display'].value == 'element' && !node.locked() && node.grabbable()) {
            return true;
          }
          return false;
        };
        BRp.load = function() {
          var r = this;
          var triggerEvents = function(target, names, e, props) {
            if (target == null) {
              target = r.cy;
            }
            for (var i = 0; i < names.length; i++) {
              var name = names[i];
              var event = Event(e, util.extend({type: name}, props));
              target.trigger(event);
            }
          };
          var isMultSelKeyDown = function(e) {
            return e.shiftKey || e.metaKey || e.ctrlKey;
          };
          var getDragListIds = function(opts) {
            var listHasId;
            if (opts.addToList && r.cy.hasCompoundNodes()) {
              if (!opts.addToList.hasId) {
                opts.addToList.hasId = {};
                for (var i = 0; i < opts.addToList.length; i++) {
                  var ele = opts.addToList[i];
                  opts.addToList.hasId[ele.id()] = true;
                }
              }
              listHasId = opts.addToList.hasId;
            }
            return listHasId || {};
          };
          var addDescendantsToDrag = function(node, opts) {
            if (!node._private.cy.hasCompoundNodes()) {
              return;
            }
            if (opts.inDragLayer == null && opts.addToList == null) {
              return;
            }
            var listHasId = getDragListIds(opts);
            var innerNodes = node.descendants();
            for (var i = 0; i < innerNodes.size(); i++) {
              var iNode = innerNodes[i];
              var _p = iNode._private;
              if (opts.inDragLayer) {
                _p.rscratch.inDragLayer = true;
              }
              if (opts.addToList && !listHasId[iNode.id()]) {
                opts.addToList.push(iNode);
                listHasId[iNode.id()] = true;
                _p.grabbed = true;
              }
              var edges = _p.edges;
              for (var j = 0; opts.inDragLayer && j < edges.length; j++) {
                edges[j]._private.rscratch.inDragLayer = true;
              }
            }
          };
          var addNodeToDrag = function(node, opts) {
            var _p = node._private;
            var listHasId = getDragListIds(opts);
            if (opts.inDragLayer) {
              _p.rscratch.inDragLayer = true;
            }
            if (opts.addToList && !listHasId[node.id()]) {
              opts.addToList.push(node);
              listHasId[node.id()] = true;
              _p.grabbed = true;
            }
            var edges = _p.edges;
            for (var i = 0; opts.inDragLayer && i < edges.length; i++) {
              edges[i]._private.rscratch.inDragLayer = true;
            }
            addDescendantsToDrag(node, opts);
            updateAncestorsInDragLayer(node, {inDragLayer: opts.inDragLayer});
          };
          var freeDraggedElements = function(draggedElements) {
            if (!draggedElements) {
              return;
            }
            for (var i = 0; i < draggedElements.length; i++) {
              var dEi_p = draggedElements[i]._private;
              if (dEi_p.group === 'nodes') {
                dEi_p.rscratch.inDragLayer = false;
                dEi_p.grabbed = false;
                var sEdges = dEi_p.edges;
                for (var j = 0; j < sEdges.length; j++) {
                  sEdges[j]._private.rscratch.inDragLayer = false;
                }
                updateAncestorsInDragLayer(draggedElements[i], {inDragLayer: false});
              } else if (dEi_p.group === 'edges') {
                dEi_p.rscratch.inDragLayer = false;
              }
            }
          };
          var updateAncestorsInDragLayer = function(node, opts) {
            if (opts.inDragLayer == null && opts.addToList == null) {
              return;
            }
            var parent = node;
            if (!node._private.cy.hasCompoundNodes()) {
              return;
            }
            while (parent.parent().nonempty()) {
              parent = parent.parent()[0];
            }
            if (parent == node) {
              return;
            }
            var nodes = parent.descendants().merge(parent).unmerge(node).unmerge(node.descendants());
            ;
            var edges = nodes.connectedEdges();
            var listHasId = getDragListIds(opts);
            for (var i = 0; i < nodes.size(); i++) {
              if (opts.inDragLayer !== undefined) {
                nodes[i]._private.rscratch.inDragLayer = opts.inDragLayer;
              }
              if (opts.addToList && !listHasId[nodes[i].id()]) {
                opts.addToList.push(nodes[i]);
                listHasId[nodes[i].id()] = true;
                nodes[i]._private.grabbed = true;
              }
            }
            for (var j = 0; opts.inDragLayer !== undefined && j < edges.length; j++) {
              edges[j]._private.rscratch.inDragLayer = opts.inDragLayer;
            }
          };
          if (typeof MutationObserver !== 'undefined') {
            r.removeObserver = new MutationObserver(function(mutns) {
              for (var i = 0; i < mutns.length; i++) {
                var mutn = mutns[i];
                var rNodes = mutn.removedNodes;
                if (rNodes) {
                  for (var j = 0; j < rNodes.length; j++) {
                    var rNode = rNodes[j];
                    if (rNode === r.container) {
                      r.destroy();
                      break;
                    }
                  }
                }
              }
            });
            if (r.container.parentNode) {
              r.removeObserver.observe(r.container.parentNode, {childList: true});
            }
          } else {
            r.registerBinding(r.container, 'DOMNodeRemoved', function(e) {
              r.destroy();
            });
          }
          r.registerBinding(window, 'resize', util.debounce(function(e) {
            r.invalidateContainerClientCoordsCache();
            r.matchCanvasSize(r.container);
            r.redrawHint('eles', true);
            r.redraw();
          }, 100));
          var invalCtnrBBOnScroll = function(domEle) {
            r.registerBinding(domEle, 'scroll', function(e) {
              r.invalidateContainerClientCoordsCache();
            });
          };
          var bbCtnr = r.cy.container();
          for (; ; ) {
            invalCtnrBBOnScroll(bbCtnr);
            if (bbCtnr.parentNode) {
              bbCtnr = bbCtnr.parentNode;
            } else {
              break;
            }
          }
          r.registerBinding(r.container, 'contextmenu', function(e) {
            e.preventDefault();
          });
          var inBoxSelection = function() {
            return r.selection[4] !== 0;
          };
          r.registerBinding(r.container, 'mousedown', function(e) {
            e.preventDefault();
            r.hoverData.capture = true;
            r.hoverData.which = e.which;
            var cy = r.cy;
            var pos = r.projectIntoViewport(e.clientX, e.clientY);
            var select = r.selection;
            var near = r.findNearestElement(pos[0], pos[1], true, false);
            var draggedElements = r.dragData.possibleDragElements;
            r.hoverData.mdownPos = pos;
            var checkForTaphold = function() {
              r.hoverData.tapholdCancelled = false;
              clearTimeout(r.hoverData.tapholdTimeout);
              r.hoverData.tapholdTimeout = setTimeout(function() {
                if (r.hoverData.tapholdCancelled) {
                  return;
                } else {
                  var ele = r.hoverData.down;
                  if (ele) {
                    ele.trigger(Event(e, {
                      type: 'taphold',
                      cyPosition: {
                        x: pos[0],
                        y: pos[1]
                      }
                    }));
                  } else {
                    cy.trigger(Event(e, {
                      type: 'taphold',
                      cyPosition: {
                        x: pos[0],
                        y: pos[1]
                      }
                    }));
                  }
                }
              }, r.tapholdDuration);
            };
            if (e.which == 3) {
              r.hoverData.cxtStarted = true;
              var cxtEvt = Event(e, {
                type: 'cxttapstart',
                cyPosition: {
                  x: pos[0],
                  y: pos[1]
                }
              });
              if (near) {
                near.activate();
                near.trigger(cxtEvt);
                r.hoverData.down = near;
              } else {
                cy.trigger(cxtEvt);
              }
              r.hoverData.downTime = (new Date()).getTime();
              r.hoverData.cxtDragged = false;
            } else if (e.which == 1) {
              if (near) {
                near.activate();
              }
              {
                if (near != null) {
                  if (r.nodeIsDraggable(near)) {
                    var grabEvent = Event(e, {
                      type: 'grab',
                      cyPosition: {
                        x: pos[0],
                        y: pos[1]
                      }
                    });
                    if (near.isNode() && !near.selected()) {
                      draggedElements = r.dragData.possibleDragElements = [];
                      addNodeToDrag(near, {addToList: draggedElements});
                      near.trigger(grabEvent);
                    } else if (near.isNode() && near.selected()) {
                      draggedElements = r.dragData.possibleDragElements = [];
                      var selectedNodes = cy.$(function() {
                        return this.isNode() && this.selected();
                      });
                      for (var i = 0; i < selectedNodes.length; i++) {
                        if (r.nodeIsDraggable(selectedNodes[i])) {
                          addNodeToDrag(selectedNodes[i], {addToList: draggedElements});
                        }
                      }
                      near.trigger(grabEvent);
                    }
                    r.redrawHint('eles', true);
                    r.redrawHint('drag', true);
                  }
                }
                r.hoverData.down = near;
                r.hoverData.downTime = (new Date()).getTime();
              }
              triggerEvents(near, ['mousedown', 'tapstart', 'vmousedown'], e, {cyPosition: {
                  x: pos[0],
                  y: pos[1]
                }});
              if (near == null) {
                select[4] = 1;
                r.data.bgActivePosistion = {
                  x: pos[0],
                  y: pos[1]
                };
                r.redrawHint('select', true);
                r.redraw();
              } else if (near.isEdge()) {
                select[4] = 1;
              }
              checkForTaphold();
            }
            select[0] = select[2] = pos[0];
            select[1] = select[3] = pos[1];
          }, false);
          r.registerBinding(window, 'mousemove', function(e) {
            var preventDefault = false;
            var capture = r.hoverData.capture;
            if (!capture) {
              var containerPageCoords = r.findContainerClientCoords();
              if (e.clientX > containerPageCoords[0] && e.clientX < containerPageCoords[0] + r.canvasWidth && e.clientY > containerPageCoords[1] && e.clientY < containerPageCoords[1] + r.canvasHeight) {} else {
                return;
              }
              var cyContainer = r.container;
              var target = e.target;
              var tParent = target.parentNode;
              var containerIsTarget = false;
              while (tParent) {
                if (tParent === cyContainer) {
                  containerIsTarget = true;
                  break;
                }
                tParent = tParent.parentNode;
              }
              if (!containerIsTarget) {
                return;
              }
            }
            var cy = r.cy;
            var zoom = cy.zoom();
            var pos = r.projectIntoViewport(e.clientX, e.clientY);
            var select = r.selection;
            var near = null;
            if (!r.hoverData.draggingEles) {
              near = r.findNearestElement(pos[0], pos[1], true, false);
            }
            var last = r.hoverData.last;
            var down = r.hoverData.down;
            var disp = [pos[0] - select[2], pos[1] - select[3]];
            var draggedElements = r.dragData.possibleDragElements;
            var dx = select[2] - select[0];
            var dx2 = dx * dx;
            var dy = select[3] - select[1];
            var dy2 = dy * dy;
            var dist2 = dx2 + dy2;
            var rdist2 = dist2 * zoom * zoom;
            var multSelKeyDown = isMultSelKeyDown(e);
            var isOverThresholdDrag = rdist2 >= r.desktopTapThreshold2;
            if (isOverThresholdDrag) {
              r.hoverData.tapholdCancelled = true;
            }
            var updateDragDelta = function() {
              var dragDelta = r.hoverData.dragDelta = r.hoverData.dragDelta || [];
              if (dragDelta.length === 0) {
                dragDelta.push(disp[0]);
                dragDelta.push(disp[1]);
              } else {
                dragDelta[0] += disp[0];
                dragDelta[1] += disp[1];
              }
            };
            preventDefault = true;
            triggerEvents(near, ['mousemove', 'vmousemove', 'tapdrag'], e, {cyPosition: {
                x: pos[0],
                y: pos[1]
              }});
            if (r.hoverData.which === 3) {
              if (isOverThresholdDrag) {
                var cxtEvt = Event(e, {
                  type: 'cxtdrag',
                  cyPosition: {
                    x: pos[0],
                    y: pos[1]
                  }
                });
                if (down) {
                  down.trigger(cxtEvt);
                } else {
                  cy.trigger(cxtEvt);
                }
                r.hoverData.cxtDragged = true;
                if (!r.hoverData.cxtOver || near !== r.hoverData.cxtOver) {
                  if (r.hoverData.cxtOver) {
                    r.hoverData.cxtOver.trigger(Event(e, {
                      type: 'cxtdragout',
                      cyPosition: {
                        x: pos[0],
                        y: pos[1]
                      }
                    }));
                  }
                  r.hoverData.cxtOver = near;
                  if (near) {
                    near.trigger(Event(e, {
                      type: 'cxtdragover',
                      cyPosition: {
                        x: pos[0],
                        y: pos[1]
                      }
                    }));
                  }
                }
              }
            } else if (r.hoverData.dragging) {
              preventDefault = true;
              if (cy.panningEnabled() && cy.userPanningEnabled()) {
                var deltaP;
                if (r.hoverData.justStartedPan) {
                  var mdPos = r.hoverData.mdownPos;
                  deltaP = {
                    x: (pos[0] - mdPos[0]) * zoom,
                    y: (pos[1] - mdPos[1]) * zoom
                  };
                  r.hoverData.justStartedPan = false;
                } else {
                  deltaP = {
                    x: disp[0] * zoom,
                    y: disp[1] * zoom
                  };
                }
                cy.panBy(deltaP);
                r.hoverData.dragged = true;
              }
              pos = r.projectIntoViewport(e.clientX, e.clientY);
            } else if (select[4] == 1 && (down == null || down.isEdge())) {
              if (!r.hoverData.dragging && cy.boxSelectionEnabled() && (multSelKeyDown || !cy.panningEnabled() || !cy.userPanningEnabled())) {
                r.data.bgActivePosistion = undefined;
                r.hoverData.selecting = true;
                r.redrawHint('select', true);
                r.redraw();
              } else if (!r.hoverData.selecting && cy.panningEnabled() && cy.userPanningEnabled()) {
                r.hoverData.dragging = true;
                r.hoverData.justStartedPan = true;
                select[4] = 0;
                r.data.bgActivePosistion = {
                  x: pos[0],
                  y: pos[1]
                };
                r.redrawHint('select', true);
                r.redraw();
              }
              if (down && down.isEdge() && down.active()) {
                down.unactivate();
              }
            } else {
              if (down && down.isEdge() && down.active()) {
                down.unactivate();
              }
              if (near != last) {
                if (last) {
                  triggerEvents(last, ['mouseout', 'tapdragout'], e, {cyPosition: {
                      x: pos[0],
                      y: pos[1]
                    }});
                }
                if (near) {
                  triggerEvents(near, ['mouseover', 'tapdragover'], e, {cyPosition: {
                      x: pos[0],
                      y: pos[1]
                    }});
                }
                r.hoverData.last = near;
              }
              if (down && down.isNode() && r.nodeIsDraggable(down)) {
                if (isOverThresholdDrag) {
                  var justStartedDrag = !r.dragData.didDrag;
                  if (justStartedDrag) {
                    r.redrawHint('eles', true);
                  }
                  r.dragData.didDrag = true;
                  var toTrigger = [];
                  for (var i = 0; i < draggedElements.length; i++) {
                    var dEle = draggedElements[i];
                    if (!r.hoverData.draggingEles) {
                      addNodeToDrag(dEle, {inDragLayer: true});
                    }
                    if (dEle.isNode() && r.nodeIsDraggable(dEle) && dEle.grabbed()) {
                      var dPos = dEle._private.position;
                      toTrigger.push(dEle);
                      if (is.number(disp[0]) && is.number(disp[1])) {
                        var updatePos = !dEle.isParent();
                        if (updatePos) {
                          dPos.x += disp[0];
                          dPos.y += disp[1];
                        }
                        if (justStartedDrag) {
                          var dragDelta = r.hoverData.dragDelta;
                          if (updatePos && is.number(dragDelta[0]) && is.number(dragDelta[1])) {
                            dPos.x += dragDelta[0];
                            dPos.y += dragDelta[1];
                          }
                        }
                      }
                    }
                  }
                  r.hoverData.draggingEles = true;
                  var tcol = (Collection(cy, toTrigger));
                  tcol.updateCompoundBounds();
                  tcol.trigger('position drag');
                  r.redrawHint('drag', true);
                  r.redraw();
                } else {
                  updateDragDelta();
                }
              }
              preventDefault = true;
            }
            select[2] = pos[0];
            select[3] = pos[1];
            if (preventDefault) {
              if (e.stopPropagation)
                e.stopPropagation();
              if (e.preventDefault)
                e.preventDefault();
              return false;
            }
          }, false);
          r.registerBinding(window, 'mouseup', function(e) {
            var capture = r.hoverData.capture;
            if (!capture) {
              return;
            }
            r.hoverData.capture = false;
            var cy = r.cy;
            var pos = r.projectIntoViewport(e.clientX, e.clientY);
            var select = r.selection;
            var near = r.findNearestElement(pos[0], pos[1], true, false);
            var draggedElements = r.dragData.possibleDragElements;
            var down = r.hoverData.down;
            var multSelKeyDown = isMultSelKeyDown(e);
            if (r.data.bgActivePosistion) {
              r.redrawHint('select', true);
              r.redraw();
            }
            r.hoverData.tapholdCancelled = true;
            r.data.bgActivePosistion = undefined;
            if (down) {
              down.unactivate();
            }
            if (r.hoverData.which === 3) {
              var cxtEvt = Event(e, {
                type: 'cxttapend',
                cyPosition: {
                  x: pos[0],
                  y: pos[1]
                }
              });
              if (down) {
                down.trigger(cxtEvt);
              } else {
                cy.trigger(cxtEvt);
              }
              if (!r.hoverData.cxtDragged) {
                var cxtTap = Event(e, {
                  type: 'cxttap',
                  cyPosition: {
                    x: pos[0],
                    y: pos[1]
                  }
                });
                if (down) {
                  down.trigger(cxtTap);
                } else {
                  cy.trigger(cxtTap);
                }
              }
              r.hoverData.cxtDragged = false;
              r.hoverData.which = null;
            } else if (r.hoverData.which === 1) {
              if ((down == null) && !r.dragData.didDrag && !r.hoverData.selecting && !r.hoverData.dragged && !isMultSelKeyDown(e)) {
                cy.$(function() {
                  return this.selected();
                }).unselect();
                if (draggedElements.length > 0) {
                  r.redrawHint('eles', true);
                }
                r.dragData.possibleDragElements = draggedElements = [];
              }
              triggerEvents(near, ['mouseup', 'tapend', 'vmouseup'], e, {cyPosition: {
                  x: pos[0],
                  y: pos[1]
                }});
              if (!r.dragData.didDrag && !r.hoverData.dragged) {
                triggerEvents(near, ['click', 'tap', 'vclick'], e, {cyPosition: {
                    x: pos[0],
                    y: pos[1]
                  }});
              }
              if (near == down && !r.dragData.didDrag && !r.hoverData.selecting) {
                if (near != null && near._private.selectable) {
                  if (r.hoverData.dragging) {} else if (cy.selectionType() === 'additive' || multSelKeyDown) {
                    if (near.selected()) {
                      near.unselect();
                    } else {
                      near.select();
                    }
                  } else {
                    if (!multSelKeyDown) {
                      cy.$(':selected').unmerge(near).unselect();
                      near.select();
                    }
                  }
                  r.redrawHint('eles', true);
                }
              }
              if (r.hoverData.selecting) {
                var newlySelected = [];
                var box = r.getAllInBox(select[0], select[1], select[2], select[3]);
                r.redrawHint('select', true);
                if (box.length > 0) {
                  r.redrawHint('eles', true);
                }
                for (var i = 0; i < box.length; i++) {
                  if (box[i]._private.selectable) {
                    newlySelected.push(box[i]);
                  }
                }
                var newlySelCol = Collection(cy, newlySelected);
                if (cy.selectionType() === 'additive') {
                  newlySelCol.select();
                } else {
                  if (!multSelKeyDown) {
                    cy.$(':selected').unmerge(newlySelCol).unselect();
                  }
                  newlySelCol.select();
                }
                r.redraw();
              }
              if (r.hoverData.dragging) {
                r.hoverData.dragging = false;
                r.redrawHint('select', true);
                r.redrawHint('eles', true);
                r.redraw();
              }
              if (!select[4]) {
                r.redrawHint('drag', true);
                r.redrawHint('eles', true);
                freeDraggedElements(draggedElements);
                if (down) {
                  down.trigger('free');
                }
              }
            }
            select[4] = 0;
            r.hoverData.down = null;
            r.hoverData.cxtStarted = false;
            r.hoverData.draggingEles = false;
            r.hoverData.selecting = false;
            r.dragData.didDrag = false;
            r.hoverData.dragged = false;
            r.hoverData.dragDelta = [];
          }, false);
          var wheelHandler = function(e) {
            if (r.scrollingPage) {
              return;
            }
            var cy = r.cy;
            var pos = r.projectIntoViewport(e.clientX, e.clientY);
            var rpos = [pos[0] * cy.zoom() + cy.pan().x, pos[1] * cy.zoom() + cy.pan().y];
            if (r.hoverData.draggingEles || r.hoverData.dragging || r.hoverData.cxtStarted || inBoxSelection()) {
              e.preventDefault();
              return;
            }
            if (cy.panningEnabled() && cy.userPanningEnabled() && cy.zoomingEnabled() && cy.userZoomingEnabled()) {
              e.preventDefault();
              r.data.wheelZooming = true;
              clearTimeout(r.data.wheelTimeout);
              r.data.wheelTimeout = setTimeout(function() {
                r.data.wheelZooming = false;
                r.redrawHint('eles', true);
                r.redraw();
              }, 150);
              var diff = e.deltaY / -250 || e.wheelDeltaY / 1000 || e.wheelDelta / 1000;
              diff = diff * r.wheelSensitivity;
              var needsWheelFix = e.deltaMode === 1;
              if (needsWheelFix) {
                diff *= 33;
              }
              cy.zoom({
                level: cy.zoom() * Math.pow(10, diff),
                renderedPosition: {
                  x: rpos[0],
                  y: rpos[1]
                }
              });
            }
          };
          r.registerBinding(r.container, 'wheel', wheelHandler, true);
          r.registerBinding(window, 'scroll', function(e) {
            r.scrollingPage = true;
            clearTimeout(r.scrollingPageTimeout);
            r.scrollingPageTimeout = setTimeout(function() {
              r.scrollingPage = false;
            }, 250);
          }, true);
          r.registerBinding(r.container, 'mouseout', function(e) {
            var pos = r.projectIntoViewport(e.clientX, e.clientY);
            r.cy.trigger(Event(e, {
              type: 'mouseout',
              cyPosition: {
                x: pos[0],
                y: pos[1]
              }
            }));
          }, false);
          r.registerBinding(r.container, 'mouseover', function(e) {
            var pos = r.projectIntoViewport(e.clientX, e.clientY);
            r.cy.trigger(Event(e, {
              type: 'mouseover',
              cyPosition: {
                x: pos[0],
                y: pos[1]
              }
            }));
          }, false);
          var f1x1,
              f1y1,
              f2x1,
              f2y1;
          var distance1,
              distance1Sq;
          var center1,
              modelCenter1;
          var offsetLeft,
              offsetTop;
          var containerWidth,
              containerHeight;
          var twoFingersStartInside;
          var distance = function(x1, y1, x2, y2) {
            return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
          };
          var distanceSq = function(x1, y1, x2, y2) {
            return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
          };
          var touchstartHandler;
          r.registerBinding(r.container, 'touchstart', touchstartHandler = function(e) {
            r.touchData.capture = true;
            r.data.bgActivePosistion = undefined;
            var cy = r.cy;
            var nodes = r.getCachedNodes();
            var edges = r.getCachedEdges();
            var now = r.touchData.now;
            var earlier = r.touchData.earlier;
            if (e.touches[0]) {
              var pos = r.projectIntoViewport(e.touches[0].clientX, e.touches[0].clientY);
              now[0] = pos[0];
              now[1] = pos[1];
            }
            if (e.touches[1]) {
              var pos = r.projectIntoViewport(e.touches[1].clientX, e.touches[1].clientY);
              now[2] = pos[0];
              now[3] = pos[1];
            }
            if (e.touches[2]) {
              var pos = r.projectIntoViewport(e.touches[2].clientX, e.touches[2].clientY);
              now[4] = pos[0];
              now[5] = pos[1];
            }
            if (e.touches[1]) {
              var release = function(eles) {
                for (var i = 0; i < eles.length; i++) {
                  eles[i]._private.grabbed = false;
                  eles[i]._private.rscratch.inDragLayer = false;
                  if (eles[i].active()) {
                    eles[i].unactivate();
                  }
                }
              };
              release(nodes);
              release(edges);
              var offsets = r.findContainerClientCoords();
              offsetLeft = offsets[0];
              offsetTop = offsets[1];
              containerWidth = offsets[2];
              containerHeight = offsets[3];
              f1x1 = e.touches[0].clientX - offsetLeft;
              f1y1 = e.touches[0].clientY - offsetTop;
              f2x1 = e.touches[1].clientX - offsetLeft;
              f2y1 = e.touches[1].clientY - offsetTop;
              twoFingersStartInside = 0 <= f1x1 && f1x1 <= containerWidth && 0 <= f2x1 && f2x1 <= containerWidth && 0 <= f1y1 && f1y1 <= containerHeight && 0 <= f2y1 && f2y1 <= containerHeight;
              ;
              var pan = cy.pan();
              var zoom = cy.zoom();
              distance1 = distance(f1x1, f1y1, f2x1, f2y1);
              distance1Sq = distanceSq(f1x1, f1y1, f2x1, f2y1);
              center1 = [(f1x1 + f2x1) / 2, (f1y1 + f2y1) / 2];
              modelCenter1 = [(center1[0] - pan.x) / zoom, (center1[1] - pan.y) / zoom];
              var cxtDistThreshold = 200;
              var cxtDistThresholdSq = cxtDistThreshold * cxtDistThreshold;
              if (distance1Sq < cxtDistThresholdSq && !e.touches[2]) {
                var near1 = r.findNearestElement(now[0], now[1], true, true);
                var near2 = r.findNearestElement(now[2], now[3], true, true);
                if (near1 && near1.isNode()) {
                  near1.activate().trigger(Event(e, {
                    type: 'cxttapstart',
                    cyPosition: {
                      x: now[0],
                      y: now[1]
                    }
                  }));
                  r.touchData.start = near1;
                } else if (near2 && near2.isNode()) {
                  near2.activate().trigger(Event(e, {
                    type: 'cxttapstart',
                    cyPosition: {
                      x: now[0],
                      y: now[1]
                    }
                  }));
                  r.touchData.start = near2;
                } else {
                  cy.trigger(Event(e, {
                    type: 'cxttapstart',
                    cyPosition: {
                      x: now[0],
                      y: now[1]
                    }
                  }));
                  r.touchData.start = null;
                }
                if (r.touchData.start) {
                  r.touchData.start._private.grabbed = false;
                }
                r.touchData.cxt = true;
                r.touchData.cxtDragged = false;
                r.data.bgActivePosistion = undefined;
                r.redraw();
                return;
              }
            }
            if (e.touches[2]) {} else if (e.touches[1]) {} else if (e.touches[0]) {
              var near = r.findNearestElement(now[0], now[1], true, true);
              if (near != null) {
                near.activate();
                r.touchData.start = near;
                if (near.isNode() && r.nodeIsDraggable(near)) {
                  var draggedEles = r.dragData.touchDragEles = [];
                  r.redrawHint('eles', true);
                  r.redrawHint('drag', true);
                  if (near.selected()) {
                    var selectedNodes = cy.$(function() {
                      return this.isNode() && this.selected();
                    });
                    for (var k = 0; k < selectedNodes.length; k++) {
                      var selectedNode = selectedNodes[k];
                      if (r.nodeIsDraggable(selectedNode)) {
                        addNodeToDrag(selectedNode, {addToList: draggedEles});
                      }
                    }
                  } else {
                    addNodeToDrag(near, {addToList: draggedEles});
                  }
                  near.trigger(Event(e, {
                    type: 'grab',
                    cyPosition: {
                      x: now[0],
                      y: now[1]
                    }
                  }));
                }
              }
              triggerEvents(near, ['touchstart', 'tapstart', 'vmousedown'], e, {cyPosition: {
                  x: now[0],
                  y: now[1]
                }});
              if (near == null) {
                r.data.bgActivePosistion = {
                  x: pos[0],
                  y: pos[1]
                };
                r.redrawHint('select', true);
                r.redraw();
              }
              for (var i = 0; i < now.length; i++) {
                earlier[i] = now[i];
                r.touchData.startPosition[i] = now[i];
              }
              r.touchData.singleTouchMoved = false;
              r.touchData.singleTouchStartTime = +new Date();
              clearTimeout(r.touchData.tapholdTimeout);
              r.touchData.tapholdTimeout = setTimeout(function() {
                if (r.touchData.singleTouchMoved === false && !r.pinching && !r.touchData.selecting) {
                  triggerEvents(r.touchData.start, ['taphold'], e, {cyPosition: {
                      x: now[0],
                      y: now[1]
                    }});
                  if (!r.touchData.start) {
                    cy.$(':selected').unselect();
                  }
                }
              }, r.tapholdDuration);
            }
          }, false);
          var touchmoveHandler;
          r.registerBinding(window, 'touchmove', touchmoveHandler = function(e) {
            var select = r.selection;
            var capture = r.touchData.capture;
            var cy = r.cy;
            var now = r.touchData.now;
            var earlier = r.touchData.earlier;
            var zoom = cy.zoom();
            if (e.touches[0]) {
              var pos = r.projectIntoViewport(e.touches[0].clientX, e.touches[0].clientY);
              now[0] = pos[0];
              now[1] = pos[1];
            }
            if (e.touches[1]) {
              var pos = r.projectIntoViewport(e.touches[1].clientX, e.touches[1].clientY);
              now[2] = pos[0];
              now[3] = pos[1];
            }
            if (e.touches[2]) {
              var pos = r.projectIntoViewport(e.touches[2].clientX, e.touches[2].clientY);
              now[4] = pos[0];
              now[5] = pos[1];
            }
            var disp = [];
            for (var j = 0; j < now.length; j++) {
              disp[j] = now[j] - earlier[j];
            }
            var startPos = r.touchData.startPosition;
            var dx = now[0] - startPos[0];
            var dx2 = dx * dx;
            var dy = now[1] - startPos[1];
            var dy2 = dy * dy;
            var dist2 = dx2 + dy2;
            var rdist2 = dist2 * zoom * zoom;
            var isOverThresholdDrag = rdist2 >= r.touchTapThreshold2;
            if (capture && r.touchData.cxt) {
              e.preventDefault();
              var f1x2 = e.touches[0].clientX - offsetLeft,
                  f1y2 = e.touches[0].clientY - offsetTop;
              var f2x2 = e.touches[1].clientX - offsetLeft,
                  f2y2 = e.touches[1].clientY - offsetTop;
              var distance2Sq = distanceSq(f1x2, f1y2, f2x2, f2y2);
              var factorSq = distance2Sq / distance1Sq;
              var distThreshold = 150;
              var distThresholdSq = distThreshold * distThreshold;
              var factorThreshold = 1.5;
              var factorThresholdSq = factorThreshold * factorThreshold;
              if (factorSq >= factorThresholdSq || distance2Sq >= distThresholdSq) {
                r.touchData.cxt = false;
                if (r.touchData.start) {
                  r.touchData.start.unactivate();
                  r.touchData.start = null;
                }
                r.data.bgActivePosistion = undefined;
                r.redrawHint('select', true);
                var cxtEvt = Event(e, {
                  type: 'cxttapend',
                  cyPosition: {
                    x: now[0],
                    y: now[1]
                  }
                });
                if (r.touchData.start) {
                  r.touchData.start.trigger(cxtEvt);
                } else {
                  cy.trigger(cxtEvt);
                }
              }
            }
            if (capture && r.touchData.cxt) {
              var cxtEvt = Event(e, {
                type: 'cxtdrag',
                cyPosition: {
                  x: now[0],
                  y: now[1]
                }
              });
              r.data.bgActivePosistion = undefined;
              r.redrawHint('select', true);
              if (r.touchData.start) {
                r.touchData.start.trigger(cxtEvt);
              } else {
                cy.trigger(cxtEvt);
              }
              if (r.touchData.start) {
                r.touchData.start._private.grabbed = false;
              }
              r.touchData.cxtDragged = true;
              var near = r.findNearestElement(now[0], now[1], true, true);
              if (!r.touchData.cxtOver || near !== r.touchData.cxtOver) {
                if (r.touchData.cxtOver) {
                  r.touchData.cxtOver.trigger(Event(e, {
                    type: 'cxtdragout',
                    cyPosition: {
                      x: now[0],
                      y: now[1]
                    }
                  }));
                }
                r.touchData.cxtOver = near;
                if (near) {
                  near.trigger(Event(e, {
                    type: 'cxtdragover',
                    cyPosition: {
                      x: now[0],
                      y: now[1]
                    }
                  }));
                }
              }
            } else if (capture && e.touches[2] && cy.boxSelectionEnabled()) {
              e.preventDefault();
              r.data.bgActivePosistion = undefined;
              this.lastThreeTouch = +new Date();
              r.touchData.selecting = true;
              r.redrawHint('select', true);
              if (!select || select.length === 0 || select[0] === undefined) {
                select[0] = (now[0] + now[2] + now[4]) / 3;
                select[1] = (now[1] + now[3] + now[5]) / 3;
                select[2] = (now[0] + now[2] + now[4]) / 3 + 1;
                select[3] = (now[1] + now[3] + now[5]) / 3 + 1;
              } else {
                select[2] = (now[0] + now[2] + now[4]) / 3;
                select[3] = (now[1] + now[3] + now[5]) / 3;
              }
              select[4] = 1;
              r.touchData.selecting = true;
              r.redraw();
            } else if (capture && e.touches[1] && cy.zoomingEnabled() && cy.panningEnabled() && cy.userZoomingEnabled() && cy.userPanningEnabled()) {
              e.preventDefault();
              r.data.bgActivePosistion = undefined;
              r.redrawHint('select', true);
              var draggedEles = r.dragData.touchDragEles;
              if (draggedEles) {
                r.redrawHint('drag', true);
                for (var i = 0; i < draggedEles.length; i++) {
                  draggedEles[i]._private.grabbed = false;
                  draggedEles[i]._private.rscratch.inDragLayer = false;
                }
              }
              var f1x2 = e.touches[0].clientX - offsetLeft,
                  f1y2 = e.touches[0].clientY - offsetTop;
              var f2x2 = e.touches[1].clientX - offsetLeft,
                  f2y2 = e.touches[1].clientY - offsetTop;
              var distance2 = distance(f1x2, f1y2, f2x2, f2y2);
              var factor = distance2 / distance1;
              if (factor != 1 && twoFingersStartInside) {
                var df1x = f1x2 - f1x1;
                var df1y = f1y2 - f1y1;
                var df2x = f2x2 - f2x1;
                var df2y = f2y2 - f2y1;
                var tx = (df1x + df2x) / 2;
                var ty = (df1y + df2y) / 2;
                var zoom1 = cy.zoom();
                var zoom2 = zoom1 * factor;
                var pan1 = cy.pan();
                var ctrx = modelCenter1[0] * zoom1 + pan1.x;
                var ctry = modelCenter1[1] * zoom1 + pan1.y;
                var pan2 = {
                  x: -zoom2 / zoom1 * (ctrx - pan1.x - tx) + ctrx,
                  y: -zoom2 / zoom1 * (ctry - pan1.y - ty) + ctry
                };
                if (r.touchData.start) {
                  var draggedEles = r.dragData.touchDragEles;
                  if (draggedEles) {
                    for (var i = 0; i < draggedEles.length; i++) {
                      var dEi_p = draggedEles[i]._private;
                      dEi_p.grabbed = false;
                      dEi_p.rscratch.inDragLayer = false;
                    }
                  }
                  var start_p = r.touchData.start._private;
                  start_p.active = false;
                  start_p.grabbed = false;
                  start_p.rscratch.inDragLayer = false;
                  r.redrawHint('drag', true);
                  r.touchData.start.trigger('free').trigger('unactivate');
                  ;
                }
                cy.viewport({
                  zoom: zoom2,
                  pan: pan2,
                  cancelOnFailedZoom: true
                });
                distance1 = distance2;
                f1x1 = f1x2;
                f1y1 = f1y2;
                f2x1 = f2x2;
                f2y1 = f2y2;
                r.pinching = true;
              }
              if (e.touches[0]) {
                var pos = r.projectIntoViewport(e.touches[0].clientX, e.touches[0].clientY);
                now[0] = pos[0];
                now[1] = pos[1];
              }
              if (e.touches[1]) {
                var pos = r.projectIntoViewport(e.touches[1].clientX, e.touches[1].clientY);
                now[2] = pos[0];
                now[3] = pos[1];
              }
              if (e.touches[2]) {
                var pos = r.projectIntoViewport(e.touches[2].clientX, e.touches[2].clientY);
                now[4] = pos[0];
                now[5] = pos[1];
              }
            } else if (e.touches[0]) {
              var start = r.touchData.start;
              var last = r.touchData.last;
              var near = near || r.findNearestElement(now[0], now[1], true, true);
              if (start != null) {
                e.preventDefault();
              }
              if (start != null && start._private.group == 'nodes' && r.nodeIsDraggable(start)) {
                if (isOverThresholdDrag) {
                  var draggedEles = r.dragData.touchDragEles;
                  var justStartedDrag = !r.dragData.didDrag;
                  for (var k = 0; k < draggedEles.length; k++) {
                    var draggedEle = draggedEles[k];
                    if (justStartedDrag) {
                      addNodeToDrag(draggedEle, {inDragLayer: true});
                    }
                    if (r.nodeIsDraggable(draggedEle) && draggedEle.isNode() && draggedEle.grabbed()) {
                      r.dragData.didDrag = true;
                      var dPos = draggedEle._private.position;
                      var updatePos = !draggedEle.isParent();
                      if (updatePos && is.number(disp[0]) && is.number(disp[1])) {
                        dPos.x += disp[0];
                        dPos.y += disp[1];
                      }
                      if (justStartedDrag) {
                        r.redrawHint('eles', true);
                        var dragDelta = r.touchData.dragDelta;
                        if (updatePos && is.number(dragDelta[0]) && is.number(dragDelta[1])) {
                          dPos.x += dragDelta[0];
                          dPos.y += dragDelta[1];
                        }
                      }
                    }
                  }
                  var tcol = Collection(cy, draggedEles);
                  tcol.updateCompoundBounds();
                  tcol.trigger('position drag');
                  r.hoverData.draggingEles = true;
                  r.redrawHint('drag', true);
                  if (r.touchData.startPosition[0] == earlier[0] && r.touchData.startPosition[1] == earlier[1]) {
                    r.redrawHint('eles', true);
                  }
                  r.redraw();
                } else {
                  var dragDelta = r.touchData.dragDelta = r.touchData.dragDelta || [];
                  if (dragDelta.length === 0) {
                    dragDelta.push(disp[0]);
                    dragDelta.push(disp[1]);
                  } else {
                    dragDelta[0] += disp[0];
                    dragDelta[1] += disp[1];
                  }
                }
              }
              {
                triggerEvents((start || near), ['touchmove', 'tapdrag', 'vmousemove'], e, {cyPosition: {
                    x: now[0],
                    y: now[1]
                  }});
                if (near != last) {
                  if (last) {
                    last.trigger(Event(e, {
                      type: 'tapdragout',
                      cyPosition: {
                        x: now[0],
                        y: now[1]
                      }
                    }));
                  }
                  if (near) {
                    near.trigger(Event(e, {
                      type: 'tapdragover',
                      cyPosition: {
                        x: now[0],
                        y: now[1]
                      }
                    }));
                  }
                }
                r.touchData.last = near;
              }
              for (var i = 0; i < now.length; i++) {
                if (now[i] && r.touchData.startPosition[i] && isOverThresholdDrag) {
                  r.touchData.singleTouchMoved = true;
                }
              }
              if (capture && (start == null || start.isEdge()) && cy.panningEnabled() && cy.userPanningEnabled()) {
                e.preventDefault();
                if (r.swipePanning) {
                  cy.panBy({
                    x: disp[0] * zoom,
                    y: disp[1] * zoom
                  });
                } else if (isOverThresholdDrag) {
                  r.swipePanning = true;
                  cy.panBy({
                    x: dx * zoom,
                    y: dy * zoom
                  });
                  if (start) {
                    start.unactivate();
                    if (!r.data.bgActivePosistion) {
                      r.data.bgActivePosistion = {
                        x: now[0],
                        y: now[1]
                      };
                    }
                    r.redrawHint('select', true);
                    r.touchData.start = null;
                  }
                }
                var pos = r.projectIntoViewport(e.touches[0].clientX, e.touches[0].clientY);
                now[0] = pos[0];
                now[1] = pos[1];
              }
            }
            for (var j = 0; j < now.length; j++) {
              earlier[j] = now[j];
            }
          }, false);
          var touchcancelHandler;
          r.registerBinding(window, 'touchcancel', touchcancelHandler = function(e) {
            var start = r.touchData.start;
            r.touchData.capture = false;
            if (start) {
              start.unactivate();
            }
          });
          var touchendHandler;
          r.registerBinding(window, 'touchend', touchendHandler = function(e) {
            var start = r.touchData.start;
            var capture = r.touchData.capture;
            if (capture) {
              r.touchData.capture = false;
              e.preventDefault();
            } else {
              return;
            }
            var select = r.selection;
            r.swipePanning = false;
            r.hoverData.draggingEles = false;
            var cy = r.cy;
            var zoom = cy.zoom();
            var now = r.touchData.now;
            var earlier = r.touchData.earlier;
            if (e.touches[0]) {
              var pos = r.projectIntoViewport(e.touches[0].clientX, e.touches[0].clientY);
              now[0] = pos[0];
              now[1] = pos[1];
            }
            if (e.touches[1]) {
              var pos = r.projectIntoViewport(e.touches[1].clientX, e.touches[1].clientY);
              now[2] = pos[0];
              now[3] = pos[1];
            }
            if (e.touches[2]) {
              var pos = r.projectIntoViewport(e.touches[2].clientX, e.touches[2].clientY);
              now[4] = pos[0];
              now[5] = pos[1];
            }
            if (start) {
              start.unactivate();
            }
            var ctxTapend;
            if (r.touchData.cxt) {
              ctxTapend = Event(e, {
                type: 'cxttapend',
                cyPosition: {
                  x: now[0],
                  y: now[1]
                }
              });
              if (start) {
                start.trigger(ctxTapend);
              } else {
                cy.trigger(ctxTapend);
              }
              if (!r.touchData.cxtDragged) {
                var ctxTap = Event(e, {
                  type: 'cxttap',
                  cyPosition: {
                    x: now[0],
                    y: now[1]
                  }
                });
                if (start) {
                  start.trigger(ctxTap);
                } else {
                  cy.trigger(ctxTap);
                }
              }
              if (r.touchData.start) {
                r.touchData.start._private.grabbed = false;
              }
              r.touchData.cxt = false;
              r.touchData.start = null;
              r.redraw();
              return;
            }
            if (!e.touches[2] && cy.boxSelectionEnabled() && r.touchData.selecting) {
              r.touchData.selecting = false;
              var newlySelected = [];
              var box = r.getAllInBox(select[0], select[1], select[2], select[3]);
              select[0] = undefined;
              select[1] = undefined;
              select[2] = undefined;
              select[3] = undefined;
              select[4] = 0;
              r.redrawHint('select', true);
              for (var i = 0; i < box.length; i++) {
                if (box[i]._private.selectable) {
                  newlySelected.push(box[i]);
                }
              }
              var newlySelCol = Collection(cy, newlySelected);
              newlySelCol.select();
              if (newlySelCol.length > 0) {
                r.redrawHint('eles', true);
              } else {
                r.redraw();
              }
            }
            var updateStartStyle = false;
            if (start != null) {
              start._private.active = false;
              updateStartStyle = true;
              start.unactivate();
            }
            if (e.touches[2]) {
              r.data.bgActivePosistion = undefined;
              r.redrawHint('select', true);
            } else if (e.touches[1]) {} else if (e.touches[0]) {} else if (!e.touches[0]) {
              r.data.bgActivePosistion = undefined;
              r.redrawHint('select', true);
              var draggedEles = r.dragData.touchDragEles;
              if (start != null) {
                var startWasGrabbed = start._private.grabbed;
                freeDraggedElements(draggedEles);
                r.redrawHint('drag', true);
                r.redrawHint('eles', true);
                if (startWasGrabbed) {
                  start.trigger('free');
                }
                triggerEvents(start, ['touchend', 'tapend', 'vmouseup'], e, {cyPosition: {
                    x: now[0],
                    y: now[1]
                  }});
                start.unactivate();
                r.touchData.start = null;
              } else {
                var near = r.findNearestElement(now[0], now[1], true, true);
                triggerEvents(near, ['touchend', 'tapend', 'vmouseup'], e, {cyPosition: {
                    x: now[0],
                    y: now[1]
                  }});
              }
              var dx = r.touchData.startPosition[0] - now[0];
              var dx2 = dx * dx;
              var dy = r.touchData.startPosition[1] - now[1];
              var dy2 = dy * dy;
              var dist2 = dx2 + dy2;
              var rdist2 = dist2 * zoom * zoom;
              if (start != null && !r.dragData.didDrag && start._private.selectable && rdist2 < r.touchTapThreshold2 && !r.pinching) {
                if (cy.selectionType() === 'single') {
                  cy.$(':selected').unmerge(start).unselect();
                  start.select();
                } else {
                  if (start.selected()) {
                    start.unselect();
                  } else {
                    start.select();
                  }
                }
                updateStartStyle = true;
                r.redrawHint('eles', true);
              }
              if (!r.touchData.singleTouchMoved) {
                triggerEvents(start, ['tap', 'vclick'], e, {cyPosition: {
                    x: now[0],
                    y: now[1]
                  }});
              }
              r.touchData.singleTouchMoved = true;
            }
            for (var j = 0; j < now.length; j++) {
              earlier[j] = now[j];
            }
            r.dragData.didDrag = false;
            if (e.touches.length === 0) {
              r.touchData.dragDelta = [];
            }
            if (updateStartStyle && start) {
              start.updateStyle(false);
            }
            if (e.touches.length < 2) {
              r.pinching = false;
              r.redrawHint('eles', true);
              r.redraw();
            }
          }, false);
          if (typeof TouchEvent === 'undefined') {
            var pointers = [];
            var makeTouch = function(e) {
              return {
                clientX: e.clientX,
                clientY: e.clientY,
                force: 1,
                identifier: e.pointerId,
                pageX: e.pageX,
                pageY: e.pageY,
                radiusX: e.width / 2,
                radiusY: e.height / 2,
                screenX: e.screenX,
                screenY: e.screenY,
                target: e.target
              };
            };
            var makePointer = function(e) {
              return {
                event: e,
                touch: makeTouch(e)
              };
            };
            var addPointer = function(e) {
              pointers.push(makePointer(e));
            };
            var removePointer = function(e) {
              for (var i = 0; i < pointers.length; i++) {
                var p = pointers[i];
                if (p.event.pointerId === e.pointerId) {
                  pointers.splice(i, 1);
                  return;
                }
              }
            };
            var updatePointer = function(e) {
              var p = pointers.filter(function(p) {
                return p.event.pointerId === e.pointerId;
              })[0];
              p.event = e;
              p.touch = makeTouch(e);
            };
            var addTouchesToEvent = function(e) {
              e.touches = pointers.map(function(p) {
                return p.touch;
              });
            };
            var pointerIsMouse = function(e) {
              return e.pointerType === 'mouse' || e.pointerType === 4;
            };
            r.registerBinding(r.container, 'pointerdown', function(e) {
              if (pointerIsMouse(e)) {
                return;
              }
              e.preventDefault();
              addPointer(e);
              addTouchesToEvent(e);
              touchstartHandler(e);
            });
            r.registerBinding(r.container, 'pointerup', function(e) {
              if (pointerIsMouse(e)) {
                return;
              }
              removePointer(e);
              addTouchesToEvent(e);
              touchendHandler(e);
            });
            r.registerBinding(r.container, 'pointercancel', function(e) {
              if (pointerIsMouse(e)) {
                return;
              }
              removePointer(e);
              addTouchesToEvent(e);
              touchcancelHandler(e);
            });
            r.registerBinding(r.container, 'pointermove', function(e) {
              if (pointerIsMouse(e)) {
                return;
              }
              e.preventDefault();
              updatePointer(e);
              addTouchesToEvent(e);
              touchmoveHandler(e);
            });
          }
        };
        module.exports = BRp;
      }, {
        "../../../collection": 23,
        "../../../event": 42,
        "../../../is": 77,
        "../../../util": 94
      }],
      60: [function(_dereq_, module, exports) {
        'use strict';
        var math = _dereq_('../../../math');
        var BRp = {};
        BRp.registerNodeShapes = function() {
          var nodeShapes = this.nodeShapes = {};
          var renderer = this;
          nodeShapes['ellipse'] = {
            name: 'ellipse',
            draw: function(context, centerX, centerY, width, height) {
              renderer.nodeShapeImpl(this.name)(context, centerX, centerY, width, height);
            },
            intersectLine: function(nodeX, nodeY, width, height, x, y, padding) {
              return math.intersectLineEllipse(x, y, nodeX, nodeY, width / 2 + padding, height / 2 + padding);
              ;
            },
            checkPoint: function(x, y, padding, width, height, centerX, centerY) {
              x -= centerX;
              y -= centerY;
              x /= (width / 2 + padding);
              y /= (height / 2 + padding);
              return x * x + y * y <= 1;
            }
          };
          function generatePolygon(name, points) {
            return (nodeShapes[name] = {
              name: name,
              points: points,
              draw: function(context, centerX, centerY, width, height) {
                renderer.nodeShapeImpl('polygon')(context, centerX, centerY, width, height, this.points);
              },
              intersectLine: function(nodeX, nodeY, width, height, x, y, padding) {
                return math.polygonIntersectLine(x, y, this.points, nodeX, nodeY, width / 2, height / 2, padding);
                ;
              },
              checkPoint: function(x, y, padding, width, height, centerX, centerY) {
                return math.pointInsidePolygon(x, y, nodeShapes[name].points, centerX, centerY, width, height, [0, -1], padding);
                ;
              }
            });
          }
          generatePolygon('triangle', math.generateUnitNgonPointsFitToSquare(3, 0));
          generatePolygon('square', math.generateUnitNgonPointsFitToSquare(4, 0));
          nodeShapes['rectangle'] = nodeShapes['square'];
          nodeShapes['roundrectangle'] = {
            name: 'roundrectangle',
            points: math.generateUnitNgonPointsFitToSquare(4, 0),
            draw: function(context, centerX, centerY, width, height) {
              renderer.nodeShapeImpl(this.name)(context, centerX, centerY, width, height);
            },
            intersectLine: function(nodeX, nodeY, width, height, x, y, padding) {
              return math.roundRectangleIntersectLine(x, y, nodeX, nodeY, width, height, padding);
              ;
            },
            checkPoint: function(x, y, padding, width, height, centerX, centerY) {
              var cornerRadius = math.getRoundRectangleRadius(width, height);
              if (math.pointInsidePolygon(x, y, this.points, centerX, centerY, width, height - 2 * cornerRadius, [0, -1], padding)) {
                return true;
              }
              if (math.pointInsidePolygon(x, y, this.points, centerX, centerY, width - 2 * cornerRadius, height, [0, -1], padding)) {
                return true;
              }
              var checkInEllipse = function(x, y, centerX, centerY, width, height, padding) {
                x -= centerX;
                y -= centerY;
                x /= (width / 2 + padding);
                y /= (height / 2 + padding);
                return (x * x + y * y <= 1);
              };
              if (checkInEllipse(x, y, centerX - width / 2 + cornerRadius, centerY - height / 2 + cornerRadius, cornerRadius * 2, cornerRadius * 2, padding)) {
                return true;
              }
              if (checkInEllipse(x, y, centerX + width / 2 - cornerRadius, centerY - height / 2 + cornerRadius, cornerRadius * 2, cornerRadius * 2, padding)) {
                return true;
              }
              if (checkInEllipse(x, y, centerX + width / 2 - cornerRadius, centerY + height / 2 - cornerRadius, cornerRadius * 2, cornerRadius * 2, padding)) {
                return true;
              }
              if (checkInEllipse(x, y, centerX - width / 2 + cornerRadius, centerY + height / 2 - cornerRadius, cornerRadius * 2, cornerRadius * 2, padding)) {
                return true;
              }
              return false;
            }
          };
          generatePolygon('diamond', [0, 1, 1, 0, 0, -1, -1, 0]);
          generatePolygon('pentagon', math.generateUnitNgonPointsFitToSquare(5, 0));
          generatePolygon('hexagon', math.generateUnitNgonPointsFitToSquare(6, 0));
          generatePolygon('heptagon', math.generateUnitNgonPointsFitToSquare(7, 0));
          generatePolygon('octagon', math.generateUnitNgonPointsFitToSquare(8, 0));
          var star5Points = new Array(20);
          {
            var outerPoints = math.generateUnitNgonPoints(5, 0);
            var innerPoints = math.generateUnitNgonPoints(5, Math.PI / 5);
            var innerRadius = 0.5 * (3 - Math.sqrt(5));
            innerRadius *= 1.57;
            for (var i = 0; i < innerPoints.length / 2; i++) {
              innerPoints[i * 2] *= innerRadius;
              innerPoints[i * 2 + 1] *= innerRadius;
            }
            for (var i = 0; i < 20 / 4; i++) {
              star5Points[i * 4] = outerPoints[i * 2];
              star5Points[i * 4 + 1] = outerPoints[i * 2 + 1];
              star5Points[i * 4 + 2] = innerPoints[i * 2];
              star5Points[i * 4 + 3] = innerPoints[i * 2 + 1];
            }
          }
          star5Points = math.fitPolygonToSquare(star5Points);
          generatePolygon('star', star5Points);
          generatePolygon('vee', [-1, -1, 0, -0.333, 1, -1, 0, 1]);
          generatePolygon('rhomboid', [-1, -1, 0.333, -1, 1, 1, -0.333, 1]);
          nodeShapes.makePolygon = function(points) {
            var key = points.join('$');
            var name = 'polygon-' + key;
            var shape;
            if ((shape = nodeShapes[name])) {
              return shape;
            }
            return generatePolygon(name, points);
          };
        };
        module.exports = BRp;
      }, {"../../../math": 79}],
      61: [function(_dereq_, module, exports) {
        'use strict';
        var util = _dereq_('../../../util');
        var BRp = {};
        BRp.timeToRender = function() {
          return this.redrawTotalTime / this.redrawCount;
        };
        var minRedrawLimit = 1000 / 60;
        var maxRedrawLimit = 1000;
        BRp.redraw = function(options) {
          options = options || util.staticEmptyObject();
          var r = this;
          var forcedContext = options.forcedContext;
          if (r.averageRedrawTime === undefined) {
            r.averageRedrawTime = 0;
          }
          if (r.lastRedrawTime === undefined) {
            r.lastRedrawTime = 0;
          }
          var redrawLimit = r.lastRedrawTime;
          redrawLimit = minRedrawLimit > redrawLimit ? minRedrawLimit : redrawLimit;
          redrawLimit = redrawLimit < maxRedrawLimit ? redrawLimit : maxRedrawLimit;
          if (r.lastDrawTime === undefined) {
            r.lastDrawTime = 0;
          }
          var nowTime = Date.now();
          var timeElapsed = nowTime - r.lastDrawTime;
          var callAfterLimit = timeElapsed >= redrawLimit;
          if (!forcedContext) {
            if (!callAfterLimit) {
              r.skipFrame = true;
              return;
            }
          }
          r.requestedFrame = true;
          r.renderOptions = options;
        };
        BRp.startRenderLoop = function() {
          var r = this;
          if (r.renderLoopStarted) {
            return;
          } else {
            r.renderLoopStarted = true;
          }
          var renderFn = function() {
            if (r.destroyed) {
              return;
            }
            if (r.requestedFrame && !r.skipFrame) {
              var startTime = util.performanceNow();
              r.render(r.renderOptions);
              var endTime = r.lastRedrawTime = util.performanceNow();
              if (r.averageRedrawTime === undefined) {
                r.averageRedrawTime = endTime - startTime;
              }
              if (r.redrawCount === undefined) {
                r.redrawCount = 0;
              }
              r.redrawCount++;
              if (r.redrawTotalTime === undefined) {
                r.redrawTotalTime = 0;
              }
              var duration = endTime - startTime;
              r.redrawTotalTime += duration;
              r.lastRedrawTime = duration;
              r.averageRedrawTime = r.averageRedrawTime / 2 + duration / 2;
              r.requestedFrame = false;
            }
            r.skipFrame = false;
            util.requestAnimationFrame(renderFn);
          };
          util.requestAnimationFrame(renderFn);
        };
        module.exports = BRp;
      }, {"../../../util": 94}],
      62: [function(_dereq_, module, exports) {
        'use strict';
        var CRp = {};
        var impl;
        CRp.arrowShapeImpl = function(name) {
          return (impl || (impl = {
            'polygon': function(context, points) {
              for (var i = 0; i < points.length; i++) {
                var pt = points[i];
                context.lineTo(pt.x, pt.y);
              }
            },
            'triangle-backcurve': function(context, points, controlPoint) {
              var firstPt;
              for (var i = 0; i < points.length; i++) {
                var pt = points[i];
                if (i === 0) {
                  firstPt = pt;
                }
                context.lineTo(pt.x, pt.y);
              }
              context.quadraticCurveTo(controlPoint.x, controlPoint.y, firstPt.x, firstPt.y);
            },
            'triangle-tee': function(context, trianglePoints, teePoints) {
              var triPts = trianglePoints;
              for (var i = 0; i < triPts.length; i++) {
                var pt = triPts[i];
                context.lineTo(pt.x, pt.y);
              }
              var teePts = teePoints;
              var firstTeePt = teePoints[0];
              context.moveTo(firstTeePt.x, firstTeePt.y);
              for (var i = 0; i < teePts.length; i++) {
                var pt = teePts[i];
                context.lineTo(pt.x, pt.y);
              }
            },
            'circle': function(context, rx, ry, r) {
              context.arc(rx, ry, r, 0, Math.PI * 2, false);
            }
          }))[name];
        };
        module.exports = CRp;
      }, {}],
      63: [function(_dereq_, module, exports) {
        'use strict';
        var CRp = {};
        CRp.drawEdge = function(context, edge, drawOverlayInstead) {
          var rs = edge._private.rscratch;
          var usePaths = this.usePaths();
          if (rs.badBezier || rs.badLine || isNaN(rs.allpts[0])) {
            return;
          }
          var style = edge._private.style;
          if (style['width'].pfValue <= 0) {
            return;
          }
          var overlayPadding = style['overlay-padding'].pfValue;
          var overlayOpacity = style['overlay-opacity'].value;
          var overlayColor = style['overlay-color'].value;
          if (drawOverlayInstead) {
            if (overlayOpacity === 0) {
              return;
            }
            this.strokeStyle(context, overlayColor[0], overlayColor[1], overlayColor[2], overlayOpacity);
            context.lineCap = 'round';
            if (rs.edgeType == 'self' && !usePaths) {
              context.lineCap = 'butt';
            }
          } else {
            var lineColor = style['line-color'].value;
            this.strokeStyle(context, lineColor[0], lineColor[1], lineColor[2], style.opacity.value);
            context.lineCap = 'butt';
          }
          var edgeWidth = style['width'].pfValue + (drawOverlayInstead ? 2 * overlayPadding : 0);
          var lineStyle = drawOverlayInstead ? 'solid' : style['line-style'].value;
          context.lineWidth = edgeWidth;
          var shadowBlur = style['shadow-blur'].pfValue;
          var shadowOpacity = style['shadow-opacity'].value;
          var shadowColor = style['shadow-color'].value;
          var shadowOffsetX = style['shadow-offset-x'].pfValue;
          var shadowOffsetY = style['shadow-offset-y'].pfValue;
          this.shadowStyle(context, shadowColor, drawOverlayInstead ? 0 : shadowOpacity, shadowBlur, shadowOffsetX, shadowOffsetY);
          this.drawEdgePath(edge, context, rs.allpts, lineStyle, edgeWidth);
          this.drawArrowheads(context, edge, drawOverlayInstead);
          this.shadowStyle(context, 'transparent', 0);
        };
        CRp.drawEdgePath = function(edge, context, pts, type, width) {
          var rs = edge._private.rscratch;
          var canvasCxt = context;
          var path;
          var pathCacheHit = false;
          var usePaths = this.usePaths();
          if (usePaths) {
            var pathCacheKey = pts.join('$');
            var keyMatches = rs.pathCacheKey && rs.pathCacheKey === pathCacheKey;
            if (keyMatches) {
              path = context = rs.pathCache;
              pathCacheHit = true;
            } else {
              path = context = new Path2D();
              rs.pathCacheKey = pathCacheKey;
              rs.pathCache = path;
            }
          }
          if (canvasCxt.setLineDash) {
            switch (type) {
              case 'dotted':
                canvasCxt.setLineDash([1, 1]);
                break;
              case 'dashed':
                canvasCxt.setLineDash([6, 3]);
                break;
              case 'solid':
                canvasCxt.setLineDash([]);
                break;
            }
          }
          if (!pathCacheHit) {
            if (context.beginPath) {
              context.beginPath();
            }
            context.moveTo(pts[0], pts[1]);
            switch (rs.edgeType) {
              case 'bezier':
              case 'self':
              case 'compound':
              case 'multibezier':
                if (!rs.badBezier) {
                  for (var i = 2; i + 3 < pts.length; i += 4) {
                    context.quadraticCurveTo(pts[i], pts[i + 1], pts[i + 2], pts[i + 3]);
                  }
                }
                break;
              case 'straight':
              case 'segments':
              case 'haystack':
                if (!rs.badLine) {
                  for (var i = 2; i + 1 < pts.length; i += 2) {
                    context.lineTo(pts[i], pts[i + 1]);
                  }
                }
                break;
            }
          }
          context = canvasCxt;
          if (usePaths) {
            context.stroke(path);
          } else {
            context.stroke();
          }
          if (context.setLineDash) {
            context.setLineDash([]);
          }
        };
        CRp.drawArrowheads = function(context, edge, drawOverlayInstead) {
          if (drawOverlayInstead) {
            return;
          }
          var rs = edge._private.rscratch;
          var isHaystack = rs.edgeType === 'haystack';
          if (!isHaystack) {
            this.drawArrowhead(context, edge, 'source', rs.arrowStartX, rs.arrowStartY, rs.srcArrowAngle);
          }
          this.drawArrowhead(context, edge, 'mid-target', rs.midX, rs.midY, rs.midtgtArrowAngle);
          this.drawArrowhead(context, edge, 'mid-source', rs.midX, rs.midY, rs.midsrcArrowAngle);
          if (!isHaystack) {
            this.drawArrowhead(context, edge, 'target', rs.arrowEndX, rs.arrowEndY, rs.tgtArrowAngle);
          }
        };
        CRp.drawArrowhead = function(context, edge, prefix, x, y, angle) {
          if (isNaN(x) || x == null || isNaN(y) || y == null || isNaN(angle) || angle == null) {
            return;
          }
          var self = this;
          var style = edge._private.style;
          var arrowShape = style[prefix + '-arrow-shape'].value;
          if (arrowShape === 'none') {
            return;
          }
          var gco = context.globalCompositeOperation;
          var arrowClearFill = style[prefix + '-arrow-fill'].value === 'hollow' ? 'both' : 'filled';
          var arrowFill = style[prefix + '-arrow-fill'].value;
          if (arrowShape === 'half-triangle-overshot') {
            arrowFill = 'hollow';
            arrowClearFill = 'hollow';
          }
          if (style.opacity.value !== 1 || arrowFill === 'hollow') {
            context.globalCompositeOperation = 'destination-out';
            self.fillStyle(context, 255, 255, 255, 1);
            self.strokeStyle(context, 255, 255, 255, 1);
            self.drawArrowShape(edge, prefix, context, arrowClearFill, style['width'].pfValue, style[prefix + '-arrow-shape'].value, x, y, angle);
            context.globalCompositeOperation = gco;
          }
          var color = style[prefix + '-arrow-color'].value;
          self.fillStyle(context, color[0], color[1], color[2], style.opacity.value);
          self.strokeStyle(context, color[0], color[1], color[2], style.opacity.value);
          self.drawArrowShape(edge, prefix, context, arrowFill, style['width'].pfValue, style[prefix + '-arrow-shape'].value, x, y, angle);
        };
        CRp.drawArrowShape = function(edge, arrowType, context, fill, edgeWidth, shape, x, y, angle) {
          var r = this;
          var usePaths = this.usePaths();
          var rs = edge._private.rscratch;
          var pathCacheHit = false;
          var path;
          var canvasContext = context;
          var translation = {
            x: x,
            y: y
          };
          var size = this.getArrowWidth(edgeWidth);
          var shapeImpl = r.arrowShapes[shape];
          if (usePaths) {
            var pathCacheKey = size + '$' + shape + '$' + angle + '$' + x + '$' + y;
            rs.arrowPathCacheKey = rs.arrowPathCacheKey || {};
            rs.arrowPathCache = rs.arrowPathCache || {};
            var alreadyCached = rs.arrowPathCacheKey[arrowType] === pathCacheKey;
            if (alreadyCached) {
              path = context = rs.arrowPathCache[arrowType];
              pathCacheHit = true;
            } else {
              path = context = new Path2D();
              rs.arrowPathCacheKey[arrowType] = pathCacheKey;
              rs.arrowPathCache[arrowType] = path;
            }
          }
          if (context.beginPath) {
            context.beginPath();
          }
          if (!pathCacheHit) {
            shapeImpl.draw(context, size, angle, translation);
          }
          if (!shapeImpl.leavePathOpen && context.closePath) {
            context.closePath();
          }
          context = canvasContext;
          if (fill === 'filled' || fill === 'both') {
            if (usePaths) {
              context.fill(path);
            } else {
              context.fill();
            }
          }
          if (fill === 'hollow' || fill === 'both') {
            context.lineWidth = (shapeImpl.matchEdgeWidth ? edgeWidth : 1);
            context.lineJoin = 'miter';
            if (usePaths) {
              context.stroke(path);
            } else {
              context.stroke();
            }
          }
        };
        module.exports = CRp;
      }, {}],
      64: [function(_dereq_, module, exports) {
        'use strict';
        var CRp = {};
        CRp.safeDrawImage = function(context, img, ix, iy, iw, ih, x, y, w, h) {
          var r = this;
          try {
            context.drawImage(img, ix, iy, iw, ih, x, y, w, h);
          } catch (e) {
            r.data.canvasNeedsRedraw[r.NODE] = true;
            r.data.canvasNeedsRedraw[r.DRAG] = true;
            r.drawingImage = true;
            r.redraw();
          }
        };
        CRp.drawInscribedImage = function(context, img, node) {
          var r = this;
          var nodeX = node._private.position.x;
          var nodeY = node._private.position.y;
          var style = node._private.style;
          var fit = style['background-fit'].value;
          var xPos = style['background-position-x'];
          var yPos = style['background-position-y'];
          var repeat = style['background-repeat'].value;
          var nodeW = node.width();
          var nodeH = node.height();
          var rs = node._private.rscratch;
          var clip = style['background-clip'].value;
          var shouldClip = clip === 'node';
          var imgOpacity = style['background-image-opacity'].value;
          var imgW = img.width || img.cachedW;
          var imgH = img.height || img.cachedH;
          if (null == imgW || null == imgH) {
            document.body.appendChild(img);
            imgW = img.cachedW = img.width || img.offsetWidth;
            imgH = img.cachedH = img.height || img.offsetHeight;
            document.body.removeChild(img);
          }
          var w = imgW;
          var h = imgH;
          var bgW = style['background-width'];
          if (bgW.value !== 'auto') {
            if (bgW.units === '%') {
              w = bgW.value / 100 * nodeW;
            } else {
              w = bgW.pfValue;
            }
          }
          var bgH = style['background-height'];
          if (bgH.value !== 'auto') {
            if (bgH.units === '%') {
              h = bgH.value / 100 * nodeH;
            } else {
              h = bgH.pfValue;
            }
          }
          if (w === 0 || h === 0) {
            return;
          }
          if (fit === 'contain') {
            var scale = Math.min(nodeW / w, nodeH / h);
            w *= scale;
            h *= scale;
          } else if (fit === 'cover') {
            var scale = Math.max(nodeW / w, nodeH / h);
            w *= scale;
            h *= scale;
          }
          var x = (nodeX - nodeW / 2);
          if (xPos.units === '%') {
            x += (nodeW - w) * xPos.value / 100;
          } else {
            x += xPos.pfValue;
          }
          var y = (nodeY - nodeH / 2);
          if (yPos.units === '%') {
            y += (nodeH - h) * yPos.value / 100;
          } else {
            y += yPos.pfValue;
          }
          if (rs.pathCache) {
            x -= nodeX;
            y -= nodeY;
            nodeX = 0;
            nodeY = 0;
          }
          var gAlpha = context.globalAlpha;
          context.globalAlpha = imgOpacity;
          if (repeat === 'no-repeat') {
            if (shouldClip) {
              context.save();
              if (rs.pathCache) {
                context.clip(rs.pathCache);
              } else {
                r.nodeShapes[r.getNodeShape(node)].draw(context, nodeX, nodeY, nodeW, nodeH);
                context.clip();
              }
            }
            r.safeDrawImage(context, img, 0, 0, imgW, imgH, x, y, w, h);
            if (shouldClip) {
              context.restore();
            }
          } else {
            var pattern = context.createPattern(img, repeat);
            context.fillStyle = pattern;
            r.nodeShapes[r.getNodeShape(node)].draw(context, nodeX, nodeY, nodeW, nodeH);
            context.translate(x, y);
            context.fill();
            context.translate(-x, -y);
          }
          context.globalAlpha = gAlpha;
        };
        module.exports = CRp;
      }, {}],
      65: [function(_dereq_, module, exports) {
        'use strict';
        var is = _dereq_('../../../is');
        var CRp = {};
        CRp.drawEdgeText = function(context, edge) {
          var text = edge._private.style['label'].strValue;
          if (!text || text.match(/^\s+$/)) {
            return;
          }
          if (this.hideEdgesOnViewport && (this.dragData.didDrag || this.pinching || this.hoverData.dragging || this.data.wheel || this.swipePanning)) {
            return;
          }
          var computedSize = edge._private.style['font-size'].pfValue * edge.cy().zoom();
          var minSize = edge._private.style['min-zoomed-font-size'].pfValue;
          if (computedSize < minSize) {
            return;
          }
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          var rs = edge._private.rscratch;
          if (!is.number(rs.labelX) || !is.number(rs.labelY)) {
            return;
          }
          var style = edge._private.style;
          var autorotate = style['edge-text-rotation'].strValue === 'autorotate';
          var theta;
          if (autorotate) {
            theta = rs.labelAngle;
            context.translate(rs.labelX, rs.labelY);
            context.rotate(theta);
            this.drawText(context, edge, 0, 0);
            context.rotate(-theta);
            context.translate(-rs.labelX, -rs.labelY);
          } else {
            this.drawText(context, edge, rs.labelX, rs.labelY);
          }
        };
        CRp.drawNodeText = function(context, node) {
          var text = node._private.style['label'].strValue;
          if (!text || text.match(/^\s+$/)) {
            return;
          }
          var computedSize = node._private.style['font-size'].pfValue * node.cy().zoom();
          var minSize = node._private.style['min-zoomed-font-size'].pfValue;
          if (computedSize < minSize) {
            return;
          }
          var textHalign = node._private.style['text-halign'].strValue;
          var textValign = node._private.style['text-valign'].strValue;
          var rs = node._private.rscratch;
          if (!is.number(rs.labelX) || !is.number(rs.labelY)) {
            return;
          }
          switch (textHalign) {
            case 'left':
              context.textAlign = 'right';
              break;
            case 'right':
              context.textAlign = 'left';
              break;
            default:
              context.textAlign = 'center';
          }
          switch (textValign) {
            case 'top':
              context.textBaseline = 'bottom';
              break;
            case 'bottom':
              context.textBaseline = 'top';
              break;
            default:
              context.textBaseline = 'middle';
          }
          this.drawText(context, node, rs.labelX, rs.labelY);
        };
        CRp.getFontCache = function(context) {
          var cache;
          this.fontCaches = this.fontCaches || [];
          for (var i = 0; i < this.fontCaches.length; i++) {
            cache = this.fontCaches[i];
            if (cache.context === context) {
              return cache;
            }
          }
          cache = {context: context};
          this.fontCaches.push(cache);
          return cache;
        };
        CRp.setupTextStyle = function(context, element) {
          var parentOpacity = element.effectiveOpacity();
          var style = element._private.style;
          var labelStyle = style['font-style'].strValue;
          var labelSize = style['font-size'].pfValue + 'px';
          var labelFamily = style['font-family'].strValue;
          var labelWeight = style['font-weight'].strValue;
          var opacity = style['text-opacity'].value * style['opacity'].value * parentOpacity;
          var outlineOpacity = style['text-outline-opacity'].value * opacity;
          var color = style['color'].value;
          var outlineColor = style['text-outline-color'].value;
          var shadowBlur = style['text-shadow-blur'].pfValue;
          var shadowOpacity = style['text-shadow-opacity'].value;
          var shadowColor = style['text-shadow-color'].value;
          var shadowOffsetX = style['text-shadow-offset-x'].pfValue;
          var shadowOffsetY = style['text-shadow-offset-y'].pfValue;
          var fontCacheKey = element._private.fontKey;
          var cache = this.getFontCache(context);
          if (cache.key !== fontCacheKey) {
            context.font = labelStyle + ' ' + labelWeight + ' ' + labelSize + ' ' + labelFamily;
            cache.key = fontCacheKey;
          }
          var text = this.getLabelText(element);
          context.lineJoin = 'round';
          this.fillStyle(context, color[0], color[1], color[2], opacity);
          this.strokeStyle(context, outlineColor[0], outlineColor[1], outlineColor[2], outlineOpacity);
          this.shadowStyle(context, shadowColor, shadowOpacity, shadowBlur, shadowOffsetX, shadowOffsetY);
          return text;
        };
        function roundRect(ctx, x, y, width, height, radius) {
          var radius = radius || 5;
          ctx.beginPath();
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + width - radius, y);
          ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
          ctx.lineTo(x + width, y + height - radius);
          ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
          ctx.lineTo(x + radius, y + height);
          ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.closePath();
          ctx.fill();
        }
        CRp.drawText = function(context, element, textX, textY) {
          var _p = element._private;
          var style = _p.style;
          var rstyle = _p.rstyle;
          var rscratch = _p.rscratch;
          var parentOpacity = element.effectiveOpacity();
          if (parentOpacity === 0 || style['text-opacity'].value === 0) {
            return;
          }
          var text = this.setupTextStyle(context, element);
          var halign = style['text-halign'].value;
          var valign = style['text-valign'].value;
          if (element.isEdge()) {
            halign = 'center';
            valign = 'center';
          }
          if (element.isNode()) {
            var pLeft = style['padding-left'].pfValue;
            var pRight = style['padding-right'].pfValue;
            var pTop = style['padding-top'].pfValue;
            var pBottom = style['padding-bottom'].pfValue;
            textX += pLeft / 2;
            textX -= pRight / 2;
            textY += pTop / 2;
            textY -= pBottom / 2;
          }
          if (text != null && !isNaN(textX) && !isNaN(textY)) {
            var backgroundOpacity = style['text-background-opacity'].value;
            var borderOpacity = style['text-border-opacity'].value;
            var textBorderWidth = style['text-border-width'].pfValue;
            if (backgroundOpacity > 0 || (textBorderWidth > 0 && borderOpacity > 0)) {
              var margin = 4 + textBorderWidth / 2;
              if (element.isNode()) {
                if (valign === 'top') {
                  textY -= margin;
                } else if (valign === 'bottom') {
                  textY += margin;
                }
                if (halign === 'left') {
                  textX -= margin;
                } else if (halign === 'right') {
                  textX += margin;
                }
              }
              var bgWidth = rstyle.labelWidth;
              var bgHeight = rstyle.labelHeight;
              var bgX = textX;
              if (halign) {
                if (halign == 'center') {
                  bgX = bgX - bgWidth / 2;
                } else if (halign == 'left') {
                  bgX = bgX - bgWidth;
                }
              }
              var bgY = textY;
              if (element.isNode()) {
                if (valign == 'top') {
                  bgY = bgY - bgHeight;
                } else if (valign == 'center') {
                  bgY = bgY - bgHeight / 2;
                }
              } else {
                bgY = bgY - bgHeight / 2;
              }
              if (style['edge-text-rotation'].strValue === 'autorotate') {
                textY = 0;
                bgWidth += 4;
                bgX = textX - bgWidth / 2;
                bgY = textY - bgHeight / 2;
              } else {
                bgX -= margin;
                bgY -= margin;
                bgHeight += margin * 2;
                bgWidth += margin * 2;
              }
              if (backgroundOpacity > 0) {
                var textFill = context.fillStyle;
                var textBackgroundColor = style['text-background-color'].value;
                context.fillStyle = 'rgba(' + textBackgroundColor[0] + ',' + textBackgroundColor[1] + ',' + textBackgroundColor[2] + ',' + backgroundOpacity * parentOpacity + ')';
                var styleShape = style['text-background-shape'].strValue;
                if (styleShape == 'roundrectangle') {
                  roundRect(context, bgX, bgY, bgWidth, bgHeight, 2);
                } else {
                  context.fillRect(bgX, bgY, bgWidth, bgHeight);
                }
                context.fillStyle = textFill;
              }
              if (textBorderWidth > 0 && borderOpacity > 0) {
                var textStroke = context.strokeStyle;
                var textLineWidth = context.lineWidth;
                var textBorderColor = style['text-border-color'].value;
                var textBorderStyle = style['text-border-style'].value;
                context.strokeStyle = 'rgba(' + textBorderColor[0] + ',' + textBorderColor[1] + ',' + textBorderColor[2] + ',' + borderOpacity * parentOpacity + ')';
                context.lineWidth = textBorderWidth;
                if (context.setLineDash) {
                  switch (textBorderStyle) {
                    case 'dotted':
                      context.setLineDash([1, 1]);
                      break;
                    case 'dashed':
                      context.setLineDash([4, 2]);
                      break;
                    case 'double':
                      context.lineWidth = textBorderWidth / 4;
                      context.setLineDash([]);
                      break;
                    case 'solid':
                      context.setLineDash([]);
                      break;
                  }
                }
                context.strokeRect(bgX, bgY, bgWidth, bgHeight);
                if (textBorderStyle === 'double') {
                  var whiteWidth = textBorderWidth / 2;
                  context.strokeRect(bgX + whiteWidth, bgY + whiteWidth, bgWidth - whiteWidth * 2, bgHeight - whiteWidth * 2);
                }
                if (context.setLineDash) {
                  context.setLineDash([]);
                }
                context.lineWidth = textLineWidth;
                context.strokeStyle = textStroke;
              }
            }
            var lineWidth = 2 * style['text-outline-width'].pfValue;
            if (lineWidth > 0) {
              context.lineWidth = lineWidth;
            }
            if (style['text-wrap'].value === 'wrap') {
              var lines = rscratch.labelWrapCachedLines;
              var lineHeight = rstyle.labelHeight / lines.length;
              switch (valign) {
                case 'top':
                  textY -= (lines.length - 1) * lineHeight;
                  break;
                case 'bottom':
                  break;
                default:
                case 'center':
                  textY -= (lines.length - 1) * lineHeight / 2;
              }
              for (var l = 0; l < lines.length; l++) {
                if (lineWidth > 0) {
                  context.strokeText(lines[l], textX, textY);
                }
                context.fillText(lines[l], textX, textY);
                textY += lineHeight;
              }
            } else {
              if (lineWidth > 0) {
                context.strokeText(text, textX, textY);
              }
              context.fillText(text, textX, textY);
            }
            this.shadowStyle(context, 'transparent', 0);
          }
        };
        module.exports = CRp;
      }, {"../../../is": 77}],
      66: [function(_dereq_, module, exports) {
        'use strict';
        var is = _dereq_('../../../is');
        var CRp = {};
        CRp.drawNode = function(context, node, drawOverlayInstead) {
          var r = this;
          var nodeWidth,
              nodeHeight;
          var style = node._private.style;
          var rs = node._private.rscratch;
          var _p = node._private;
          var pos = _p.position;
          if (!is.number(pos.x) || !is.number(pos.y)) {
            return;
          }
          var usePaths = this.usePaths();
          var canvasContext = context;
          var path;
          var pathCacheHit = false;
          var overlayPadding = style['overlay-padding'].pfValue;
          var overlayOpacity = style['overlay-opacity'].value;
          var overlayColor = style['overlay-color'].value;
          if (drawOverlayInstead && overlayOpacity === 0) {
            return;
          }
          var parentOpacity = node.effectiveOpacity();
          if (parentOpacity === 0) {
            return;
          }
          nodeWidth = node.width() + style['padding-left'].pfValue + style['padding-right'].pfValue;
          nodeHeight = node.height() + style['padding-top'].pfValue + style['padding-bottom'].pfValue;
          context.lineWidth = style['border-width'].pfValue;
          if (drawOverlayInstead === undefined || !drawOverlayInstead) {
            var url = style['background-image'].value[2] || style['background-image'].value[1];
            var image;
            if (url !== undefined) {
              image = this.getCachedImage(url, function() {
                r.data.canvasNeedsRedraw[r.NODE] = true;
                r.data.canvasNeedsRedraw[r.DRAG] = true;
                r.drawingImage = true;
                r.redraw();
              });
              var prevBging = _p.backgrounding;
              _p.backgrounding = !image.complete;
              if (prevBging !== _p.backgrounding) {
                node.updateStyle(false);
              }
            }
            var bgColor = style['background-color'].value;
            var borderColor = style['border-color'].value;
            var borderStyle = style['border-style'].value;
            this.fillStyle(context, bgColor[0], bgColor[1], bgColor[2], style['background-opacity'].value * parentOpacity);
            this.strokeStyle(context, borderColor[0], borderColor[1], borderColor[2], style['border-opacity'].value * parentOpacity);
            var shadowBlur = style['shadow-blur'].pfValue;
            var shadowOpacity = style['shadow-opacity'].value;
            var shadowColor = style['shadow-color'].value;
            var shadowOffsetX = style['shadow-offset-x'].pfValue;
            var shadowOffsetY = style['shadow-offset-y'].pfValue;
            this.shadowStyle(context, shadowColor, shadowOpacity, shadowBlur, shadowOffsetX, shadowOffsetY);
            context.lineJoin = 'miter';
            if (context.setLineDash) {
              switch (borderStyle) {
                case 'dotted':
                  context.setLineDash([1, 1]);
                  break;
                case 'dashed':
                  context.setLineDash([4, 2]);
                  break;
                case 'solid':
                case 'double':
                  context.setLineDash([]);
                  break;
              }
            }
            var styleShape = style['shape'].strValue;
            if (usePaths) {
              var pathCacheKey = styleShape + '$' + nodeWidth + '$' + nodeHeight;
              context.translate(pos.x, pos.y);
              if (rs.pathCacheKey === pathCacheKey) {
                path = context = rs.pathCache;
                pathCacheHit = true;
              } else {
                path = context = new Path2D();
                rs.pathCacheKey = pathCacheKey;
                rs.pathCache = path;
              }
            }
            if (!pathCacheHit) {
              var npos = pos;
              if (usePaths) {
                npos = {
                  x: 0,
                  y: 0
                };
              }
              r.nodeShapes[this.getNodeShape(node)].draw(context, npos.x, npos.y, nodeWidth, nodeHeight);
            }
            context = canvasContext;
            if (usePaths) {
              context.fill(path);
            } else {
              context.fill();
            }
            this.shadowStyle(context, 'transparent', 0);
            if (url !== undefined) {
              if (image.complete) {
                this.drawInscribedImage(context, image, node);
              }
            }
            var darkness = style['background-blacken'].value;
            var borderWidth = style['border-width'].pfValue;
            if (this.hasPie(node)) {
              this.drawPie(context, node, parentOpacity);
              if (darkness !== 0 || borderWidth !== 0) {
                if (!usePaths) {
                  r.nodeShapes[this.getNodeShape(node)].draw(context, pos.x, pos.y, nodeWidth, nodeHeight);
                }
              }
            }
            if (darkness > 0) {
              this.fillStyle(context, 0, 0, 0, darkness);
              if (usePaths) {
                context.fill(path);
              } else {
                context.fill();
              }
            } else if (darkness < 0) {
              this.fillStyle(context, 255, 255, 255, -darkness);
              if (usePaths) {
                context.fill(path);
              } else {
                context.fill();
              }
            }
            if (borderWidth > 0) {
              if (usePaths) {
                context.stroke(path);
              } else {
                context.stroke();
              }
              if (borderStyle === 'double') {
                context.lineWidth = style['border-width'].pfValue / 3;
                var gco = context.globalCompositeOperation;
                context.globalCompositeOperation = 'destination-out';
                if (usePaths) {
                  context.stroke(path);
                } else {
                  context.stroke();
                }
                context.globalCompositeOperation = gco;
              }
            }
            if (usePaths) {
              context.translate(-pos.x, -pos.y);
            }
            if (context.setLineDash) {
              context.setLineDash([]);
            }
          } else {
            if (overlayOpacity > 0) {
              this.fillStyle(context, overlayColor[0], overlayColor[1], overlayColor[2], overlayOpacity);
              r.nodeShapes['roundrectangle'].draw(context, node._private.position.x, node._private.position.y, nodeWidth + overlayPadding * 2, nodeHeight + overlayPadding * 2);
              context.fill();
            }
          }
        };
        CRp.hasPie = function(node) {
          node = node[0];
          return node._private.hasPie;
        };
        CRp.drawPie = function(context, node, nodeOpacity) {
          node = node[0];
          var _p = node._private;
          var cyStyle = node.cy().style();
          var style = _p.style;
          var pieSize = style['pie-size'];
          var nodeW = node.width();
          var nodeH = node.height();
          var x = _p.position.x;
          var y = _p.position.y;
          var radius = Math.min(nodeW, nodeH) / 2;
          var lastPercent = 0;
          var usePaths = this.usePaths();
          if (usePaths) {
            x = 0;
            y = 0;
          }
          if (pieSize.units === '%') {
            radius = radius * pieSize.value / 100;
          } else if (pieSize.pfValue !== undefined) {
            radius = pieSize.pfValue / 2;
          }
          for (var i = 1; i <= cyStyle.pieBackgroundN; i++) {
            var size = style['pie-' + i + '-background-size'].value;
            var color = style['pie-' + i + '-background-color'].value;
            var opacity = style['pie-' + i + '-background-opacity'].value * nodeOpacity;
            var percent = size / 100;
            if (percent + lastPercent > 1) {
              percent = 1 - lastPercent;
            }
            var angleStart = 1.5 * Math.PI + 2 * Math.PI * lastPercent;
            var angleDelta = 2 * Math.PI * percent;
            var angleEnd = angleStart + angleDelta;
            if (size === 0 || lastPercent >= 1 || lastPercent + percent > 1) {
              continue;
            }
            context.beginPath();
            context.moveTo(x, y);
            context.arc(x, y, radius, angleStart, angleEnd);
            context.closePath();
            this.fillStyle(context, color[0], color[1], color[2], opacity);
            context.fill();
            lastPercent += percent;
          }
        };
        module.exports = CRp;
      }, {"../../../is": 77}],
      67: [function(_dereq_, module, exports) {
        'use strict';
        var CRp = {};
        var util = _dereq_('../../../util');
        var math = _dereq_('../../../math');
        var motionBlurDelay = 100;
        CRp.getPixelRatio = function() {
          var context = this.data.contexts[0];
          if (this.forcedPixelRatio != null) {
            return this.forcedPixelRatio;
          }
          var backingStore = context.backingStorePixelRatio || context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;
          return (window.devicePixelRatio || 1) / backingStore;
        };
        CRp.paintCache = function(context) {
          var caches = this.paintCaches = this.paintCaches || [];
          var needToCreateCache = true;
          var cache;
          for (var i = 0; i < caches.length; i++) {
            cache = caches[i];
            if (cache.context === context) {
              needToCreateCache = false;
              break;
            }
          }
          if (needToCreateCache) {
            cache = {context: context};
            caches.push(cache);
          }
          return cache;
        };
        CRp.fillStyle = function(context, r, g, b, a) {
          context.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
        };
        CRp.strokeStyle = function(context, r, g, b, a) {
          context.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
        };
        CRp.shadowStyle = function(context, color, opacity, blur, offsetX, offsetY) {
          var zoom = this.cy.zoom();
          var cache = this.paintCache(context);
          if (cache.shadowOpacity === 0 && opacity === 0) {
            return;
          }
          cache.shadowOpacity = opacity;
          if (opacity > 0) {
            context.shadowBlur = blur * zoom;
            context.shadowColor = "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + opacity + ")";
            context.shadowOffsetX = offsetX * zoom;
            context.shadowOffsetY = offsetY * zoom;
          } else {
            context.shadowBlur = 0;
            context.shadowColor = "transparent";
          }
        };
        CRp.matchCanvasSize = function(container) {
          var r = this;
          var data = r.data;
          var width = container.clientWidth;
          var height = container.clientHeight;
          var pixelRatio = r.getPixelRatio();
          var mbPxRatio = r.motionBlurPxRatio;
          if (container === r.data.bufferCanvases[r.MOTIONBLUR_BUFFER_NODE] || container === r.data.bufferCanvases[r.MOTIONBLUR_BUFFER_DRAG]) {
            pixelRatio = mbPxRatio;
          }
          var canvasWidth = width * pixelRatio;
          var canvasHeight = height * pixelRatio;
          var canvas;
          if (canvasWidth === r.canvasWidth && canvasHeight === r.canvasHeight) {
            return;
          }
          r.fontCaches = null;
          var canvasContainer = data.canvasContainer;
          canvasContainer.style.width = width + 'px';
          canvasContainer.style.height = height + 'px';
          for (var i = 0; i < r.CANVAS_LAYERS; i++) {
            canvas = data.canvases[i];
            if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
              canvas.width = canvasWidth;
              canvas.height = canvasHeight;
              canvas.style.width = width + 'px';
              canvas.style.height = height + 'px';
            }
          }
          for (var i = 0; i < r.BUFFER_COUNT; i++) {
            canvas = data.bufferCanvases[i];
            if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
              canvas.width = canvasWidth;
              canvas.height = canvasHeight;
              canvas.style.width = width + 'px';
              canvas.style.height = height + 'px';
            }
          }
          r.textureMult = 1;
          if (pixelRatio <= 1) {
            canvas = data.bufferCanvases[r.TEXTURE_BUFFER];
            r.textureMult = 2;
            canvas.width = canvasWidth * r.textureMult;
            canvas.height = canvasHeight * r.textureMult;
          }
          r.canvasWidth = canvasWidth;
          r.canvasHeight = canvasHeight;
        };
        CRp.renderTo = function(cxt, zoom, pan, pxRatio) {
          this.render({
            forcedContext: cxt,
            forcedZoom: zoom,
            forcedPan: pan,
            drawAllLayers: true,
            forcedPxRatio: pxRatio
          });
        };
        CRp.render = function(options) {
          options = options || util.staticEmptyObject();
          var forcedContext = options.forcedContext;
          var drawAllLayers = options.drawAllLayers;
          var drawOnlyNodeLayer = options.drawOnlyNodeLayer;
          var forcedZoom = options.forcedZoom;
          var forcedPan = options.forcedPan;
          var r = this;
          var pixelRatio = options.forcedPxRatio === undefined ? this.getPixelRatio() : options.forcedPxRatio;
          var cy = r.cy;
          var data = r.data;
          var needDraw = data.canvasNeedsRedraw;
          var textureDraw = r.textureOnViewport && !forcedContext && (r.pinching || r.hoverData.dragging || r.swipePanning || r.data.wheelZooming);
          var motionBlur = options.motionBlur !== undefined ? options.motionBlur : r.motionBlur;
          var mbPxRatio = r.motionBlurPxRatio;
          var hasCompoundNodes = cy.hasCompoundNodes();
          var inNodeDragGesture = r.hoverData.draggingEles;
          var inBoxSelection = r.hoverData.selecting || r.touchData.selecting ? true : false;
          motionBlur = motionBlur && !forcedContext && r.motionBlurEnabled && !inBoxSelection;
          var motionBlurFadeEffect = motionBlur;
          if (!forcedContext) {
            if (r.prevPxRatio !== pixelRatio) {
              r.invalidateContainerClientCoordsCache();
              r.matchCanvasSize(r.container);
              r.redrawHint('eles', true);
              r.redrawHint('drag', true);
            }
            r.prevPxRatio = pixelRatio;
          }
          if (!forcedContext && r.motionBlurTimeout) {
            clearTimeout(r.motionBlurTimeout);
          }
          if (motionBlur) {
            if (r.mbFrames == null) {
              r.mbFrames = 0;
            }
            if (!r.drawingImage) {
              r.mbFrames++;
            }
            if (r.mbFrames < 3) {
              motionBlurFadeEffect = false;
            }
            if (r.mbFrames > r.minMbLowQualFrames) {
              r.motionBlurPxRatio = r.mbPxRBlurry;
            }
          }
          if (r.clearingMotionBlur) {
            r.motionBlurPxRatio = 1;
          }
          if (r.textureDrawLastFrame && !textureDraw) {
            needDraw[r.NODE] = true;
            needDraw[r.SELECT_BOX] = true;
          }
          var edges = r.getCachedEdges();
          var coreStyle = cy.style()._private.coreStyle;
          var zoom = cy.zoom();
          var effectiveZoom = forcedZoom !== undefined ? forcedZoom : zoom;
          var pan = cy.pan();
          var effectivePan = {
            x: pan.x,
            y: pan.y
          };
          var vp = {
            zoom: zoom,
            pan: {
              x: pan.x,
              y: pan.y
            }
          };
          var prevVp = r.prevViewport;
          var viewportIsDiff = prevVp === undefined || vp.zoom !== prevVp.zoom || vp.pan.x !== prevVp.pan.x || vp.pan.y !== prevVp.pan.y;
          if (!viewportIsDiff && !(inNodeDragGesture && !hasCompoundNodes)) {
            r.motionBlurPxRatio = 1;
          }
          if (forcedPan) {
            effectivePan = forcedPan;
          }
          effectiveZoom *= pixelRatio;
          effectivePan.x *= pixelRatio;
          effectivePan.y *= pixelRatio;
          var eles = {
            drag: {
              nodes: [],
              edges: [],
              eles: []
            },
            nondrag: {
              nodes: [],
              edges: [],
              eles: []
            }
          };
          function mbclear(context, x, y, w, h) {
            var gco = context.globalCompositeOperation;
            context.globalCompositeOperation = 'destination-out';
            r.fillStyle(context, 255, 255, 255, r.motionBlurTransparency);
            context.fillRect(x, y, w, h);
            context.globalCompositeOperation = gco;
          }
          function setContextTransform(context, clear) {
            var ePan,
                eZoom,
                w,
                h;
            if (!r.clearingMotionBlur && (context === data.bufferContexts[r.MOTIONBLUR_BUFFER_NODE] || context === data.bufferContexts[r.MOTIONBLUR_BUFFER_DRAG])) {
              ePan = {
                x: pan.x * mbPxRatio,
                y: pan.y * mbPxRatio
              };
              eZoom = zoom * mbPxRatio;
              w = r.canvasWidth * mbPxRatio;
              h = r.canvasHeight * mbPxRatio;
            } else {
              ePan = effectivePan;
              eZoom = effectiveZoom;
              w = r.canvasWidth;
              h = r.canvasHeight;
            }
            context.setTransform(1, 0, 0, 1, 0, 0);
            if (clear === 'motionBlur') {
              mbclear(context, 0, 0, w, h);
            } else if (!forcedContext && (clear === undefined || clear)) {
              context.clearRect(0, 0, w, h);
            }
            if (!drawAllLayers) {
              context.translate(ePan.x, ePan.y);
              context.scale(eZoom, eZoom);
            }
            if (forcedPan) {
              context.translate(forcedPan.x, forcedPan.y);
            }
            if (forcedZoom) {
              context.scale(forcedZoom, forcedZoom);
            }
          }
          if (!textureDraw) {
            r.textureDrawLastFrame = false;
          }
          if (textureDraw) {
            r.textureDrawLastFrame = true;
            var bb;
            if (!r.textureCache) {
              r.textureCache = {};
              bb = r.textureCache.bb = cy.elements().boundingBox();
              r.textureCache.texture = r.data.bufferCanvases[r.TEXTURE_BUFFER];
              var cxt = r.data.bufferContexts[r.TEXTURE_BUFFER];
              cxt.setTransform(1, 0, 0, 1, 0, 0);
              cxt.clearRect(0, 0, r.canvasWidth * r.textureMult, r.canvasHeight * r.textureMult);
              r.render({
                forcedContext: cxt,
                drawOnlyNodeLayer: true,
                forcedPxRatio: pixelRatio * r.textureMult
              });
              var vp = r.textureCache.viewport = {
                zoom: cy.zoom(),
                pan: cy.pan(),
                width: r.canvasWidth,
                height: r.canvasHeight
              };
              vp.mpan = {
                x: (0 - vp.pan.x) / vp.zoom,
                y: (0 - vp.pan.y) / vp.zoom
              };
            }
            needDraw[r.DRAG] = false;
            needDraw[r.NODE] = false;
            var context = data.contexts[r.NODE];
            var texture = r.textureCache.texture;
            var vp = r.textureCache.viewport;
            bb = r.textureCache.bb;
            context.setTransform(1, 0, 0, 1, 0, 0);
            if (motionBlur) {
              mbclear(context, 0, 0, vp.width, vp.height);
            } else {
              context.clearRect(0, 0, vp.width, vp.height);
            }
            var outsideBgColor = coreStyle['outside-texture-bg-color'].value;
            var outsideBgOpacity = coreStyle['outside-texture-bg-opacity'].value;
            r.fillStyle(context, outsideBgColor[0], outsideBgColor[1], outsideBgColor[2], outsideBgOpacity);
            context.fillRect(0, 0, vp.width, vp.height);
            var zoom = cy.zoom();
            setContextTransform(context, false);
            context.clearRect(vp.mpan.x, vp.mpan.y, vp.width / vp.zoom / pixelRatio, vp.height / vp.zoom / pixelRatio);
            context.drawImage(texture, vp.mpan.x, vp.mpan.y, vp.width / vp.zoom / pixelRatio, vp.height / vp.zoom / pixelRatio);
          } else if (r.textureOnViewport && !forcedContext) {
            r.textureCache = null;
          }
          var vpManip = (r.pinching || r.hoverData.dragging || r.swipePanning || r.data.wheelZooming || r.hoverData.draggingEles);
          var hideEdges = r.hideEdgesOnViewport && vpManip;
          var hideLabels = r.hideLabelsOnViewport && vpManip;
          if (needDraw[r.DRAG] || needDraw[r.NODE] || drawAllLayers || drawOnlyNodeLayer) {
            if (hideEdges) {} else {
              r.findEdgeControlPoints(edges);
            }
            var zEles = r.getCachedZSortedEles();
            var extent = cy.extent();
            for (var i = 0; i < zEles.length; i++) {
              var ele = zEles[i];
              var list;
              var bb = forcedContext ? null : ele.boundingBox();
              var insideExtent = forcedContext ? true : math.boundingBoxesIntersect(extent, bb);
              if (!insideExtent) {
                continue;
              }
              if (ele._private.rscratch.inDragLayer) {
                list = eles.drag;
              } else {
                list = eles.nondrag;
              }
              list.eles.push(ele);
            }
          }
          function drawElements(list, context) {
            var eles = list.eles;
            for (var i = 0; i < eles.length; i++) {
              var ele = eles[i];
              if (ele.isNode()) {
                r.drawNode(context, ele);
                if (!hideLabels) {
                  r.drawNodeText(context, ele);
                }
                r.drawNode(context, ele, true);
              } else if (!hideEdges) {
                r.drawEdge(context, ele);
                if (!hideLabels) {
                  r.drawEdgeText(context, ele);
                }
                r.drawEdge(context, ele, true);
              }
            }
          }
          var needMbClear = [];
          needMbClear[r.NODE] = !needDraw[r.NODE] && motionBlur && !r.clearedForMotionBlur[r.NODE] || r.clearingMotionBlur;
          if (needMbClear[r.NODE]) {
            r.clearedForMotionBlur[r.NODE] = true;
          }
          needMbClear[r.DRAG] = !needDraw[r.DRAG] && motionBlur && !r.clearedForMotionBlur[r.DRAG] || r.clearingMotionBlur;
          if (needMbClear[r.DRAG]) {
            r.clearedForMotionBlur[r.DRAG] = true;
          }
          if (needDraw[r.NODE] || drawAllLayers || drawOnlyNodeLayer || needMbClear[r.NODE]) {
            var useBuffer = motionBlur && !needMbClear[r.NODE] && mbPxRatio !== 1;
            var context = forcedContext || (useBuffer ? r.data.bufferContexts[r.MOTIONBLUR_BUFFER_NODE] : data.contexts[r.NODE]);
            var clear = motionBlur && !useBuffer ? 'motionBlur' : undefined;
            setContextTransform(context, clear);
            drawElements(eles.nondrag, context);
            if (!drawAllLayers && !motionBlur) {
              needDraw[r.NODE] = false;
            }
          }
          if (!drawOnlyNodeLayer && (needDraw[r.DRAG] || drawAllLayers || needMbClear[r.DRAG])) {
            var useBuffer = motionBlur && !needMbClear[r.DRAG] && mbPxRatio !== 1;
            var context = forcedContext || (useBuffer ? r.data.bufferContexts[r.MOTIONBLUR_BUFFER_DRAG] : data.contexts[r.DRAG]);
            setContextTransform(context, motionBlur && !useBuffer ? 'motionBlur' : undefined);
            drawElements(eles.drag, context);
            if (!drawAllLayers && !motionBlur) {
              needDraw[r.DRAG] = false;
            }
          }
          if (r.showFps || (!drawOnlyNodeLayer && (needDraw[r.SELECT_BOX] && !drawAllLayers))) {
            var context = forcedContext || data.contexts[r.SELECT_BOX];
            setContextTransform(context);
            if (r.selection[4] == 1 && (r.hoverData.selecting || r.touchData.selecting)) {
              var zoom = r.cy.zoom();
              var borderWidth = coreStyle['selection-box-border-width'].value / zoom;
              context.lineWidth = borderWidth;
              context.fillStyle = "rgba(" + coreStyle['selection-box-color'].value[0] + "," + coreStyle['selection-box-color'].value[1] + "," + coreStyle['selection-box-color'].value[2] + "," + coreStyle['selection-box-opacity'].value + ")";
              context.fillRect(r.selection[0], r.selection[1], r.selection[2] - r.selection[0], r.selection[3] - r.selection[1]);
              if (borderWidth > 0) {
                context.strokeStyle = "rgba(" + coreStyle['selection-box-border-color'].value[0] + "," + coreStyle['selection-box-border-color'].value[1] + "," + coreStyle['selection-box-border-color'].value[2] + "," + coreStyle['selection-box-opacity'].value + ")";
                context.strokeRect(r.selection[0], r.selection[1], r.selection[2] - r.selection[0], r.selection[3] - r.selection[1]);
              }
            }
            if (data.bgActivePosistion && !r.hoverData.selecting) {
              var zoom = r.cy.zoom();
              var pos = data.bgActivePosistion;
              context.fillStyle = "rgba(" + coreStyle['active-bg-color'].value[0] + "," + coreStyle['active-bg-color'].value[1] + "," + coreStyle['active-bg-color'].value[2] + "," + coreStyle['active-bg-opacity'].value + ")";
              context.beginPath();
              context.arc(pos.x, pos.y, coreStyle['active-bg-size'].pfValue / zoom, 0, 2 * Math.PI);
              context.fill();
            }
            var timeToRender = r.lastRedrawTime;
            if (r.showFps && timeToRender) {
              timeToRender = Math.round(timeToRender);
              var fps = Math.round(1000 / timeToRender);
              context.setTransform(1, 0, 0, 1, 0, 0);
              context.fillStyle = 'rgba(255, 0, 0, 0.75)';
              context.strokeStyle = 'rgba(255, 0, 0, 0.75)';
              context.lineWidth = 1;
              context.fillText('1 frame = ' + timeToRender + ' ms = ' + fps + ' fps', 0, 20);
              var maxFps = 60;
              context.strokeRect(0, 30, 250, 20);
              context.fillRect(0, 30, 250 * Math.min(fps / maxFps, 1), 20);
            }
            if (!drawAllLayers) {
              needDraw[r.SELECT_BOX] = false;
            }
          }
          if (motionBlur && mbPxRatio !== 1) {
            var cxtNode = data.contexts[r.NODE];
            var txtNode = r.data.bufferCanvases[r.MOTIONBLUR_BUFFER_NODE];
            var cxtDrag = data.contexts[r.DRAG];
            var txtDrag = r.data.bufferCanvases[r.MOTIONBLUR_BUFFER_DRAG];
            var drawMotionBlur = function(cxt, txt, needClear) {
              cxt.setTransform(1, 0, 0, 1, 0, 0);
              if (needClear || !motionBlurFadeEffect) {
                cxt.clearRect(0, 0, r.canvasWidth, r.canvasHeight);
              } else {
                mbclear(cxt, 0, 0, r.canvasWidth, r.canvasHeight);
              }
              var pxr = mbPxRatio;
              cxt.drawImage(txt, 0, 0, r.canvasWidth * pxr, r.canvasHeight * pxr, 0, 0, r.canvasWidth, r.canvasHeight);
            };
            if (needDraw[r.NODE] || needMbClear[r.NODE]) {
              drawMotionBlur(cxtNode, txtNode, needMbClear[r.NODE]);
              needDraw[r.NODE] = false;
            }
            if (needDraw[r.DRAG] || needMbClear[r.DRAG]) {
              drawMotionBlur(cxtDrag, txtDrag, needMbClear[r.DRAG]);
              needDraw[r.DRAG] = false;
            }
          }
          r.prevViewport = vp;
          if (r.clearingMotionBlur) {
            r.clearingMotionBlur = false;
            r.motionBlurCleared = true;
            r.motionBlur = true;
          }
          if (motionBlur) {
            r.motionBlurTimeout = setTimeout(function() {
              r.motionBlurTimeout = null;
              r.clearedForMotionBlur[r.NODE] = false;
              r.clearedForMotionBlur[r.DRAG] = false;
              r.motionBlur = false;
              r.clearingMotionBlur = !textureDraw;
              r.mbFrames = 0;
              needDraw[r.NODE] = true;
              needDraw[r.DRAG] = true;
              r.redraw();
            }, motionBlurDelay);
          }
          r.drawingImage = false;
          if (!forcedContext && !r.initrender) {
            r.initrender = true;
            cy.trigger('initrender');
          }
          if (!forcedContext) {
            cy.triggerOnRender();
          }
        };
        module.exports = CRp;
      }, {
        "../../../math": 79,
        "../../../util": 94
      }],
      68: [function(_dereq_, module, exports) {
        'use strict';
        var math = _dereq_('../../../math');
        var CRp = {};
        CRp.drawPolygonPath = function(context, x, y, width, height, points) {
          var halfW = width / 2;
          var halfH = height / 2;
          if (context.beginPath) {
            context.beginPath();
          }
          context.moveTo(x + halfW * points[0], y + halfH * points[1]);
          for (var i = 1; i < points.length / 2; i++) {
            context.lineTo(x + halfW * points[i * 2], y + halfH * points[i * 2 + 1]);
          }
          context.closePath();
        };
        CRp.drawRoundRectanglePath = function(context, x, y, width, height, radius) {
          var halfWidth = width / 2;
          var halfHeight = height / 2;
          var cornerRadius = math.getRoundRectangleRadius(width, height);
          if (context.beginPath) {
            context.beginPath();
          }
          context.moveTo(x, y - halfHeight);
          context.arcTo(x + halfWidth, y - halfHeight, x + halfWidth, y, cornerRadius);
          context.arcTo(x + halfWidth, y + halfHeight, x, y + halfHeight, cornerRadius);
          context.arcTo(x - halfWidth, y + halfHeight, x - halfWidth, y, cornerRadius);
          context.arcTo(x - halfWidth, y - halfHeight, x, y - halfHeight, cornerRadius);
          context.lineTo(x, y - halfHeight);
          context.closePath();
        };
        var sin0 = Math.sin(0);
        var cos0 = Math.cos(0);
        var sin = {};
        var cos = {};
        var ellipseStepSize = Math.PI / 40;
        for (var i = 0 * Math.PI; i < 2 * Math.PI; i += ellipseStepSize) {
          sin[i] = Math.sin(i);
          cos[i] = Math.cos(i);
        }
        CRp.drawEllipsePath = function(context, centerX, centerY, width, height) {
          if (context.beginPath) {
            context.beginPath();
          }
          if (context.ellipse) {
            context.ellipse(centerX, centerY, width / 2, height / 2, 0, 0, 2 * Math.PI);
          } else {
            var xPos,
                yPos;
            var rw = width / 2;
            var rh = height / 2;
            for (var i = 0 * Math.PI; i < 2 * Math.PI; i += ellipseStepSize) {
              xPos = centerX - (rw * sin[i]) * sin0 + (rw * cos[i]) * cos0;
              yPos = centerY + (rh * cos[i]) * sin0 + (rh * sin[i]) * cos0;
              if (i === 0) {
                context.moveTo(xPos, yPos);
              } else {
                context.lineTo(xPos, yPos);
              }
            }
          }
          context.closePath();
        };
        module.exports = CRp;
      }, {"../../../math": 79}],
      69: [function(_dereq_, module, exports) {
        'use strict';
        var is = _dereq_('../../../is');
        var CRp = {};
        CRp.createBuffer = function(w, h) {
          var buffer = document.createElement('canvas');
          buffer.width = w;
          buffer.height = h;
          return [buffer, buffer.getContext('2d')];
        };
        CRp.bufferCanvasImage = function(options) {
          var cy = this.cy;
          var bb = cy.elements().boundingBox();
          var width = options.full ? Math.ceil(bb.w) : this.container.clientWidth;
          var height = options.full ? Math.ceil(bb.h) : this.container.clientHeight;
          var scale = 1;
          if (options.scale !== undefined) {
            width *= options.scale;
            height *= options.scale;
            scale = options.scale;
          } else if (is.number(options.maxWidth) || is.number(options.maxHeight)) {
            var maxScaleW = Infinity;
            var maxScaleH = Infinity;
            if (is.number(options.maxWidth)) {
              maxScaleW = scale * options.maxWidth / width;
            }
            if (is.number(options.maxHeight)) {
              maxScaleH = scale * options.maxHeight / height;
            }
            scale = Math.min(maxScaleW, maxScaleH);
            width *= scale;
            height *= scale;
          }
          var buffCanvas = document.createElement('canvas');
          buffCanvas.width = width;
          buffCanvas.height = height;
          buffCanvas.style.width = width + 'px';
          buffCanvas.style.height = height + 'px';
          var buffCxt = buffCanvas.getContext('2d');
          if (width > 0 && height > 0) {
            buffCxt.clearRect(0, 0, width, height);
            if (options.bg) {
              buffCxt.fillStyle = options.bg;
              buffCxt.rect(0, 0, width, height);
              buffCxt.fill();
            }
            buffCxt.globalCompositeOperation = 'source-over';
            if (options.full) {
              this.render({
                forcedContext: buffCxt,
                drawAllLayers: true,
                forcedZoom: scale,
                forcedPan: {
                  x: -bb.x1 * scale,
                  y: -bb.y1 * scale
                },
                forcedPxRatio: 1
              });
            } else {
              var cyPan = cy.pan();
              var pan = {
                x: cyPan.x * scale,
                y: cyPan.y * scale
              };
              var zoom = cy.zoom() * scale;
              this.render({
                forcedContext: buffCxt,
                drawAllLayers: true,
                forcedZoom: zoom,
                forcedPan: pan,
                forcedPxRatio: 1
              });
            }
          }
          return buffCanvas;
        };
        CRp.png = function(options) {
          return this.bufferCanvasImage(options).toDataURL('image/png');
        };
        CRp.jpg = function(options) {
          return this.bufferCanvasImage(options).toDataURL('image/jpeg');
        };
        module.exports = CRp;
      }, {"../../../is": 77}],
      70: [function(_dereq_, module, exports) {
        'use strict';
        var util = _dereq_('../../../util');
        var is = _dereq_('../../../is');
        var CR = CanvasRenderer;
        var CRp = CanvasRenderer.prototype;
        CRp.CANVAS_LAYERS = 3;
        CRp.SELECT_BOX = 0;
        CRp.DRAG = 1;
        CRp.NODE = 2;
        CRp.BUFFER_COUNT = 3;
        CRp.TEXTURE_BUFFER = 0;
        CRp.MOTIONBLUR_BUFFER_NODE = 1;
        CRp.MOTIONBLUR_BUFFER_DRAG = 2;
        function CanvasRenderer(options) {
          var r = this;
          r.data = {
            canvases: new Array(CRp.CANVAS_LAYERS),
            contexts: new Array(CRp.CANVAS_LAYERS),
            canvasNeedsRedraw: new Array(CRp.CANVAS_LAYERS),
            bufferCanvases: new Array(CRp.BUFFER_COUNT),
            bufferContexts: new Array(CRp.CANVAS_LAYERS)
          };
          r.data.canvasContainer = document.createElement('div');
          var containerStyle = r.data.canvasContainer.style;
          r.data.canvasContainer.setAttribute('style', '-webkit-tap-highlight-color: rgba(0,0,0,0);');
          containerStyle.position = 'relative';
          containerStyle.zIndex = '0';
          containerStyle.overflow = 'hidden';
          var container = options.cy.container();
          container.appendChild(r.data.canvasContainer);
          container.setAttribute('style', (container.getAttribute('style') || '') + '-webkit-tap-highlight-color: rgba(0,0,0,0);');
          for (var i = 0; i < CRp.CANVAS_LAYERS; i++) {
            var canvas = r.data.canvases[i] = document.createElement('canvas');
            r.data.contexts[i] = canvas.getContext('2d');
            canvas.setAttribute('style', '-webkit-user-select: none; -moz-user-select: -moz-none; user-select: none; -webkit-tap-highlight-color: rgba(0,0,0,0); outline-style: none;' + (is.ms() ? ' -ms-touch-action: none; touch-action: none; ' : ''));
            canvas.style.position = 'absolute';
            canvas.setAttribute('data-id', 'layer' + i);
            canvas.style.zIndex = String(CRp.CANVAS_LAYERS - i);
            r.data.canvasContainer.appendChild(canvas);
            r.data.canvasNeedsRedraw[i] = false;
          }
          r.data.topCanvas = r.data.canvases[0];
          r.data.canvases[CRp.NODE].setAttribute('data-id', 'layer' + CRp.NODE + '-node');
          r.data.canvases[CRp.SELECT_BOX].setAttribute('data-id', 'layer' + CRp.SELECT_BOX + '-selectbox');
          r.data.canvases[CRp.DRAG].setAttribute('data-id', 'layer' + CRp.DRAG + '-drag');
          for (var i = 0; i < CRp.BUFFER_COUNT; i++) {
            r.data.bufferCanvases[i] = document.createElement('canvas');
            r.data.bufferContexts[i] = r.data.bufferCanvases[i].getContext('2d');
            r.data.bufferCanvases[i].style.position = 'absolute';
            r.data.bufferCanvases[i].setAttribute('data-id', 'buffer' + i);
            r.data.bufferCanvases[i].style.zIndex = String(-i - 1);
            r.data.bufferCanvases[i].style.visibility = 'hidden';
          }
          r.pathsEnabled = true;
        }
        CRp.redrawHint = function(group, bool) {
          var r = this;
          switch (group) {
            case 'eles':
              r.data.canvasNeedsRedraw[CRp.NODE] = bool;
              break;
            case 'drag':
              r.data.canvasNeedsRedraw[CRp.DRAG] = bool;
              break;
            case 'select':
              r.data.canvasNeedsRedraw[CRp.SELECT_BOX] = bool;
              break;
          }
        };
        var pathsImpld = typeof Path2D !== 'undefined';
        CRp.path2dEnabled = function(on) {
          if (on === undefined) {
            return this.pathsEnabled;
          }
          this.pathsEnabled = on ? true : false;
        };
        CRp.usePaths = function() {
          return pathsImpld && this.pathsEnabled;
        };
        [_dereq_('./arrow-shapes'), _dereq_('./drawing-edges'), _dereq_('./drawing-images'), _dereq_('./drawing-label-text'), _dereq_('./drawing-nodes'), _dereq_('./drawing-redraw'), _dereq_('./drawing-shapes'), _dereq_('./export-image'), _dereq_('./node-shapes')].forEach(function(props) {
          util.extend(CRp, props);
        });
        module.exports = CR;
      }, {
        "../../../is": 77,
        "../../../util": 94,
        "./arrow-shapes": 62,
        "./drawing-edges": 63,
        "./drawing-images": 64,
        "./drawing-label-text": 65,
        "./drawing-nodes": 66,
        "./drawing-redraw": 67,
        "./drawing-shapes": 68,
        "./export-image": 69,
        "./node-shapes": 71
      }],
      71: [function(_dereq_, module, exports) {
        'use strict';
        var CRp = {};
        var impl;
        CRp.nodeShapeImpl = function(name) {
          var self = this;
          return (impl || (impl = {
            'ellipse': function(context, centerX, centerY, width, height) {
              self.drawEllipsePath(context, centerX, centerY, width, height);
            },
            'polygon': function(context, centerX, centerY, width, height, points) {
              self.drawPolygonPath(context, centerX, centerY, width, height, points);
            },
            'roundrectangle': function(context, centerX, centerY, width, height) {
              self.drawRoundRectanglePath(context, centerX, centerY, width, height, 10);
            }
          }))[name];
        };
        module.exports = CRp;
      }, {}],
      72: [function(_dereq_, module, exports) {
        'use strict';
        module.exports = [{
          name: 'null',
          impl: _dereq_('./null')
        }, {
          name: 'base',
          impl: _dereq_('./base')
        }, {
          name: 'canvas',
          impl: _dereq_('./canvas')
        }];
      }, {
        "./base": 58,
        "./canvas": 70,
        "./null": 73
      }],
      73: [function(_dereq_, module, exports) {
        'use strict';
        function NullRenderer(options) {
          this.options = options;
          this.notifications = 0;
        }
        var noop = function() {};
        NullRenderer.prototype = {
          recalculateRenderedStyle: noop,
          notify: function() {
            this.notifications++;
          },
          init: noop
        };
        module.exports = NullRenderer;
      }, {}],
      74: [function(_dereq_, module, exports) {
        'use strict';
        var is = _dereq_('./is');
        var util = _dereq_('./util');
        var Thread = _dereq_('./thread');
        var Promise = _dereq_('./promise');
        var define = _dereq_('./define');
        var Fabric = function(N) {
          if (!(this instanceof Fabric)) {
            return new Fabric(N);
          }
          this._private = {pass: []};
          var defN = 4;
          if (is.number(N)) {}
          if (typeof navigator !== 'undefined' && navigator.hardwareConcurrency != null) {
            N = navigator.hardwareConcurrency;
          } else {
            try {
              N = _dereq_('os').cpus().length;
            } catch (err) {
              N = defN;
            }
          }
          for (var i = 0; i < N; i++) {
            this[i] = new Thread();
          }
          this.length = N;
        };
        var fabfn = Fabric.prototype;
        util.extend(fabfn, {
          instanceString: function() {
            return 'fabric';
          },
          require: function(fn, as) {
            for (var i = 0; i < this.length; i++) {
              var thread = this[i];
              thread.require(fn, as);
            }
            return this;
          },
          random: function() {
            var i = Math.round((this.length - 1) * Math.random());
            var thread = this[i];
            return thread;
          },
          run: function(fn) {
            var pass = this._private.pass.shift();
            return this.random().pass(pass).run(fn);
          },
          message: function(m) {
            return this.random().message(m);
          },
          broadcast: function(m) {
            for (var i = 0; i < this.length; i++) {
              var thread = this[i];
              thread.message(m);
            }
            return this;
          },
          stop: function() {
            for (var i = 0; i < this.length; i++) {
              var thread = this[i];
              thread.stop();
            }
            return this;
          },
          pass: function(data) {
            var pass = this._private.pass;
            if (is.array(data)) {
              pass.push(data);
            } else {
              throw 'Only arrays may be used with fabric.pass()';
            }
            return this;
          },
          spreadSize: function() {
            var subsize = Math.ceil(this._private.pass[0].length / this.length);
            subsize = Math.max(1, subsize);
            return subsize;
          },
          spread: function(fn) {
            var self = this;
            var _p = self._private;
            var subsize = self.spreadSize();
            var pass = _p.pass.shift().concat([]);
            var runPs = [];
            for (var i = 0; i < this.length; i++) {
              var thread = this[i];
              var slice = pass.splice(0, subsize);
              var runP = thread.pass(slice).run(fn);
              runPs.push(runP);
              var doneEarly = pass.length === 0;
              if (doneEarly) {
                break;
              }
            }
            return Promise.all(runPs).then(function(thens) {
              var postpass = [];
              var p = 0;
              for (var i = 0; i < thens.length; i++) {
                var then = thens[i];
                for (var j = 0; j < then.length; j++) {
                  var t = then[j];
                  postpass[p++] = t;
                }
              }
              return postpass;
            });
          },
          map: function(fn) {
            var self = this;
            self.require(fn, '_$_$_fabmap');
            return self.spread(function(split) {
              var mapped = [];
              var origResolve = resolve;
              resolve = function(val) {
                mapped.push(val);
              };
              for (var i = 0; i < split.length; i++) {
                var oldLen = mapped.length;
                var ret = _$_$_fabmap(split[i]);
                var nothingInsdByResolve = oldLen === mapped.length;
                if (nothingInsdByResolve) {
                  mapped.push(ret);
                }
              }
              resolve = origResolve;
              return mapped;
            });
          },
          filter: function(fn) {
            var _p = this._private;
            var pass = _p.pass[0];
            return this.map(fn).then(function(include) {
              var ret = [];
              for (var i = 0; i < pass.length; i++) {
                var datum = pass[i];
                var incDatum = include[i];
                if (incDatum) {
                  ret.push(datum);
                }
              }
              return ret;
            });
          },
          sort: function(cmp) {
            var self = this;
            var P = this._private.pass[0].length;
            var subsize = this.spreadSize();
            cmp = cmp || function(a, b) {
              if (a < b) {
                return -1;
              } else if (a > b) {
                return 1;
              }
              return 0;
            };
            self.require(cmp, '_$_$_cmp');
            return self.spread(function(split) {
              var sortedSplit = split.sort(_$_$_cmp);
              resolve(sortedSplit);
            }).then(function(joined) {
              var merge = function(i, j, max) {
                j = Math.min(j, P);
                max = Math.min(max, P);
                var l = i;
                var r = j;
                var sorted = [];
                for (var k = l; k < max; k++) {
                  var eleI = joined[i];
                  var eleJ = joined[j];
                  if (i < r && (j >= max || cmp(eleI, eleJ) <= 0)) {
                    sorted.push(eleI);
                    i++;
                  } else {
                    sorted.push(eleJ);
                    j++;
                  }
                }
                for (var k = 0; k < sorted.length; k++) {
                  var index = l + k;
                  joined[index] = sorted[k];
                }
              };
              for (var splitL = subsize; splitL < P; splitL *= 2) {
                for (var i = 0; i < P; i += 2 * splitL) {
                  merge(i, i + splitL, i + 2 * splitL);
                }
              }
              return joined;
            });
          }
        });
        var defineRandomPasser = function(opts) {
          opts = opts || {};
          return function(fn, arg1) {
            var pass = this._private.pass.shift();
            return this.random().pass(pass)[opts.threadFn](fn, arg1);
          };
        };
        util.extend(fabfn, {
          randomMap: defineRandomPasser({threadFn: 'map'}),
          reduce: defineRandomPasser({threadFn: 'reduce'}),
          reduceRight: defineRandomPasser({threadFn: 'reduceRight'})
        });
        var fn = fabfn;
        fn.promise = fn.run;
        fn.terminate = fn.halt = fn.stop;
        fn.include = fn.require;
        util.extend(fabfn, {
          on: define.on(),
          one: define.on({unbindSelfOnTrigger: true}),
          off: define.off(),
          trigger: define.trigger()
        });
        define.eventAliasesOn(fabfn);
        module.exports = Fabric;
      }, {
        "./define": 41,
        "./is": 77,
        "./promise": 80,
        "./thread": 92,
        "./util": 94,
        "os": undefined
      }],
      75: [function(_dereq_, module, exports) {
        'use strict';
        (function() {
          var Heap,
              defaultCmp,
              floor,
              heapify,
              heappop,
              heappush,
              heappushpop,
              heapreplace,
              insort,
              min,
              nlargest,
              nsmallest,
              updateItem,
              _siftdown,
              _siftup;
          floor = Math.floor, min = Math.min;
          defaultCmp = function(x, y) {
            if (x < y) {
              return -1;
            }
            if (x > y) {
              return 1;
            }
            return 0;
          };
          insort = function(a, x, lo, hi, cmp) {
            var mid;
            if (lo == null) {
              lo = 0;
            }
            if (cmp == null) {
              cmp = defaultCmp;
            }
            if (lo < 0) {
              throw new Error('lo must be non-negative');
            }
            if (hi == null) {
              hi = a.length;
            }
            while (lo < hi) {
              mid = floor((lo + hi) / 2);
              if (cmp(x, a[mid]) < 0) {
                hi = mid;
              } else {
                lo = mid + 1;
              }
            }
            return ([].splice.apply(a, [lo, lo - lo].concat(x)), x);
          };
          heappush = function(array, item, cmp) {
            if (cmp == null) {
              cmp = defaultCmp;
            }
            array.push(item);
            return _siftdown(array, 0, array.length - 1, cmp);
          };
          heappop = function(array, cmp) {
            var lastelt,
                returnitem;
            if (cmp == null) {
              cmp = defaultCmp;
            }
            lastelt = array.pop();
            if (array.length) {
              returnitem = array[0];
              array[0] = lastelt;
              _siftup(array, 0, cmp);
            } else {
              returnitem = lastelt;
            }
            return returnitem;
          };
          heapreplace = function(array, item, cmp) {
            var returnitem;
            if (cmp == null) {
              cmp = defaultCmp;
            }
            returnitem = array[0];
            array[0] = item;
            _siftup(array, 0, cmp);
            return returnitem;
          };
          heappushpop = function(array, item, cmp) {
            var _ref;
            if (cmp == null) {
              cmp = defaultCmp;
            }
            if (array.length && cmp(array[0], item) < 0) {
              _ref = [array[0], item], item = _ref[0], array[0] = _ref[1];
              _siftup(array, 0, cmp);
            }
            return item;
          };
          heapify = function(array, cmp) {
            var i,
                _i,
                _j,
                _len,
                _ref,
                _ref1,
                _results,
                _results1;
            if (cmp == null) {
              cmp = defaultCmp;
            }
            _ref1 = (function() {
              _results1 = [];
              for (var _j = 0,
                  _ref = floor(array.length / 2); 0 <= _ref ? _j < _ref : _j > _ref; 0 <= _ref ? _j++ : _j--) {
                _results1.push(_j);
              }
              return _results1;
            }).apply(this).reverse();
            _results = [];
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              i = _ref1[_i];
              _results.push(_siftup(array, i, cmp));
            }
            return _results;
          };
          updateItem = function(array, item, cmp) {
            var pos;
            if (cmp == null) {
              cmp = defaultCmp;
            }
            pos = array.indexOf(item);
            if (pos === -1) {
              return;
            }
            _siftdown(array, 0, pos, cmp);
            return _siftup(array, pos, cmp);
          };
          nlargest = function(array, n, cmp) {
            var elem,
                result,
                _i,
                _len,
                _ref;
            if (cmp == null) {
              cmp = defaultCmp;
            }
            result = array.slice(0, n);
            if (!result.length) {
              return result;
            }
            heapify(result, cmp);
            _ref = array.slice(n);
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              elem = _ref[_i];
              heappushpop(result, elem, cmp);
            }
            return result.sort(cmp).reverse();
          };
          nsmallest = function(array, n, cmp) {
            var elem,
                i,
                los,
                result,
                _i,
                _j,
                _len,
                _ref,
                _ref1,
                _results;
            if (cmp == null) {
              cmp = defaultCmp;
            }
            if (n * 10 <= array.length) {
              result = array.slice(0, n).sort(cmp);
              if (!result.length) {
                return result;
              }
              los = result[result.length - 1];
              _ref = array.slice(n);
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                elem = _ref[_i];
                if (cmp(elem, los) < 0) {
                  insort(result, elem, 0, null, cmp);
                  result.pop();
                  los = result[result.length - 1];
                }
              }
              return result;
            }
            heapify(array, cmp);
            _results = [];
            for (i = _j = 0, _ref1 = min(n, array.length); 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
              _results.push(heappop(array, cmp));
            }
            return _results;
          };
          _siftdown = function(array, startpos, pos, cmp) {
            var newitem,
                parent,
                parentpos;
            if (cmp == null) {
              cmp = defaultCmp;
            }
            newitem = array[pos];
            while (pos > startpos) {
              parentpos = (pos - 1) >> 1;
              parent = array[parentpos];
              if (cmp(newitem, parent) < 0) {
                array[pos] = parent;
                pos = parentpos;
                continue;
              }
              break;
            }
            return array[pos] = newitem;
          };
          _siftup = function(array, pos, cmp) {
            var childpos,
                endpos,
                newitem,
                rightpos,
                startpos;
            if (cmp == null) {
              cmp = defaultCmp;
            }
            endpos = array.length;
            startpos = pos;
            newitem = array[pos];
            childpos = 2 * pos + 1;
            while (childpos < endpos) {
              rightpos = childpos + 1;
              if (rightpos < endpos && !(cmp(array[childpos], array[rightpos]) < 0)) {
                childpos = rightpos;
              }
              array[pos] = array[childpos];
              pos = childpos;
              childpos = 2 * pos + 1;
            }
            array[pos] = newitem;
            return _siftdown(array, startpos, pos, cmp);
          };
          Heap = (function() {
            Heap.push = heappush;
            Heap.pop = heappop;
            Heap.replace = heapreplace;
            Heap.pushpop = heappushpop;
            Heap.heapify = heapify;
            Heap.updateItem = updateItem;
            Heap.nlargest = nlargest;
            Heap.nsmallest = nsmallest;
            function Heap(cmp) {
              this.cmp = cmp != null ? cmp : defaultCmp;
              this.nodes = [];
            }
            Heap.prototype.push = function(x) {
              return heappush(this.nodes, x, this.cmp);
            };
            Heap.prototype.pop = function() {
              return heappop(this.nodes, this.cmp);
            };
            Heap.prototype.peek = function() {
              return this.nodes[0];
            };
            Heap.prototype.contains = function(x) {
              return this.nodes.indexOf(x) !== -1;
            };
            Heap.prototype.replace = function(x) {
              return heapreplace(this.nodes, x, this.cmp);
            };
            Heap.prototype.pushpop = function(x) {
              return heappushpop(this.nodes, x, this.cmp);
            };
            Heap.prototype.heapify = function() {
              return heapify(this.nodes, this.cmp);
            };
            Heap.prototype.updateItem = function(x) {
              return updateItem(this.nodes, x, this.cmp);
            };
            Heap.prototype.clear = function() {
              return this.nodes = [];
            };
            Heap.prototype.empty = function() {
              return this.nodes.length === 0;
            };
            Heap.prototype.size = function() {
              return this.nodes.length;
            };
            Heap.prototype.clone = function() {
              var heap;
              heap = new Heap();
              heap.nodes = this.nodes.slice(0);
              return heap;
            };
            Heap.prototype.toArray = function() {
              return this.nodes.slice(0);
            };
            Heap.prototype.insert = Heap.prototype.push;
            Heap.prototype.top = Heap.prototype.peek;
            Heap.prototype.front = Heap.prototype.peek;
            Heap.prototype.has = Heap.prototype.contains;
            Heap.prototype.copy = Heap.prototype.clone;
            return Heap;
          })();
          (function(root, factory) {
            if (typeof define === 'function' && define.amd) {
              return define([], factory);
            } else if (typeof exports === 'object') {
              return module.exports = factory();
            } else {
              return root.Heap = factory();
            }
          })(this, function() {
            return Heap;
          });
        }).call(this);
      }, {}],
      76: [function(_dereq_, module, exports) {
        'use strict';
        var window = _dereq_('./window');
        var is = _dereq_('./is');
        var Core = _dereq_('./core');
        var extension = _dereq_('./extension');
        var registerJquery = _dereq_('./jquery-plugin');
        var Stylesheet = _dereq_('./stylesheet');
        var Thread = _dereq_('./thread');
        var Fabric = _dereq_('./fabric');
        var cytoscape = function(options) {
          if (options === undefined) {
            options = {};
          }
          if (is.plainObject(options)) {
            return new Core(options);
          } else if (is.string(options)) {
            return extension.apply(extension, arguments);
          }
        };
        cytoscape.version = '2.6.6';
        if (window && window.jQuery) {
          registerJquery(window.jQuery, cytoscape);
        }
        cytoscape.registerJquery = function(jQuery) {
          registerJquery(jQuery, cytoscape);
        };
        cytoscape.stylesheet = cytoscape.Stylesheet = Stylesheet;
        cytoscape.thread = cytoscape.Thread = Thread;
        cytoscape.fabric = cytoscape.Fabric = Fabric;
        module.exports = cytoscape;
      }, {
        "./core": 34,
        "./extension": 43,
        "./fabric": 74,
        "./is": 77,
        "./jquery-plugin": 78,
        "./stylesheet": 91,
        "./thread": 92,
        "./window": 100
      }],
      77: [function(_dereq_, module, exports) {
        'use strict';
        var window = _dereq_('./window');
        var navigator = window ? window.navigator : null;
        var typeofstr = typeof'';
        var typeofobj = typeof{};
        var typeoffn = typeof function() {};
        var typeofhtmlele = typeof HTMLElement;
        var instanceStr = function(obj) {
          return obj && obj.instanceString && is.fn(obj.instanceString) ? obj.instanceString() : null;
        };
        var is = {
          defined: function(obj) {
            return obj != null;
          },
          string: function(obj) {
            return obj != null && typeof obj == typeofstr;
          },
          fn: function(obj) {
            return obj != null && typeof obj === typeoffn;
          },
          array: function(obj) {
            return Array.isArray ? Array.isArray(obj) : obj != null && obj instanceof Array;
          },
          plainObject: function(obj) {
            return obj != null && typeof obj === typeofobj && !is.array(obj) && obj.constructor === Object;
          },
          object: function(obj) {
            return obj != null && typeof obj === typeofobj;
          },
          number: function(obj) {
            return obj != null && typeof obj === typeof 1 && !isNaN(obj);
          },
          integer: function(obj) {
            return is.number(obj) && Math.floor(obj) === obj;
          },
          bool: function(obj) {
            return obj != null && typeof obj === typeof true;
          },
          htmlElement: function(obj) {
            if ('undefined' === typeofhtmlele) {
              return undefined;
            } else {
              return null != obj && obj instanceof HTMLElement;
            }
          },
          elementOrCollection: function(obj) {
            return is.element(obj) || is.collection(obj);
          },
          element: function(obj) {
            return instanceStr(obj) === 'collection' && obj._private.single;
          },
          collection: function(obj) {
            return instanceStr(obj) === 'collection' && !obj._private.single;
          },
          core: function(obj) {
            return instanceStr(obj) === 'core';
          },
          style: function(obj) {
            return instanceStr(obj) === 'style';
          },
          stylesheet: function(obj) {
            return instanceStr(obj) === 'stylesheet';
          },
          event: function(obj) {
            return instanceStr(obj) === 'event';
          },
          thread: function(obj) {
            return instanceStr(obj) === 'thread';
          },
          fabric: function(obj) {
            return instanceStr(obj) === 'fabric';
          },
          emptyString: function(obj) {
            if (!obj) {
              return true;
            } else if (is.string(obj)) {
              if (obj === '' || obj.match(/^\s+$/)) {
                return true;
              }
            }
            return false;
          },
          nonemptyString: function(obj) {
            if (obj && is.string(obj) && obj !== '' && !obj.match(/^\s+$/)) {
              return true;
            }
            return false;
          },
          domElement: function(obj) {
            if (typeof HTMLElement === 'undefined') {
              return false;
            } else {
              return obj instanceof HTMLElement;
            }
          },
          boundingBox: function(obj) {
            return is.plainObject(obj) && is.number(obj.x1) && is.number(obj.x2) && is.number(obj.y1) && is.number(obj.y2);
            ;
          },
          promise: function(obj) {
            return is.object(obj) && is.fn(obj.then);
          },
          touch: function() {
            return window && (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
          },
          gecko: function() {
            return typeof InstallTrigger !== 'undefined' || ('MozAppearance' in document.documentElement.style);
          },
          webkit: function() {
            return typeof webkitURL !== 'undefined' || ('WebkitAppearance' in document.documentElement.style);
          },
          chromium: function() {
            return typeof chrome !== 'undefined';
          },
          khtml: function() {
            return navigator && navigator.vendor.match(/kde/i);
          },
          khtmlEtc: function() {
            return is.khtml() || is.webkit() || is.chromium();
          },
          ms: function() {
            return navigator && navigator.userAgent.match(/msie|trident|edge/i);
          },
          windows: function() {
            return navigator && navigator.appVersion.match(/Win/i);
          },
          mac: function() {
            return navigator && navigator.appVersion.match(/Mac/i);
          },
          linux: function() {
            return navigator && navigator.appVersion.match(/Linux/i);
          },
          unix: function() {
            return navigator && navigator.appVersion.match(/X11/i);
          }
        };
        module.exports = is;
      }, {"./window": 100}],
      78: [function(_dereq_, module, exports) {
        'use strict';
        var is = _dereq_('./is');
        var cyReg = function($ele) {
          var d = $ele[0]._cyreg = $ele[0]._cyreg || {};
          return d;
        };
        var registerJquery = function($, cytoscape) {
          if (!$) {
            return;
          }
          if ($.fn.cytoscape) {
            return;
          }
          $.fn.cytoscape = function(opts) {
            var $this = $(this);
            if (opts === 'get') {
              return cyReg($this).cy;
            } else if (is.fn(opts)) {
              var ready = opts;
              var cy = cyReg($this).cy;
              if (cy && cy.isReady()) {
                cy.trigger('ready', [], ready);
              } else {
                var data = cyReg($this);
                var readies = data.readies = data.readies || [];
                readies.push(ready);
              }
            } else if (is.plainObject(opts)) {
              return $this.each(function() {
                var options = $.extend({}, opts, {container: $(this)[0]});
                cytoscape(options);
              });
            }
          };
          $.cytoscape = cytoscape;
          if ($.fn.cy == null && $.cy == null) {
            $.fn.cy = $.fn.cytoscape;
            $.cy = $.cytoscape;
          }
        };
        module.exports = registerJquery;
      }, {"./is": 77}],
      79: [function(_dereq_, module, exports) {
        'use strict';
        var math = {};
        math.signum = function(x) {
          if (x > 0) {
            return 1;
          } else if (x < 0) {
            return -1;
          } else {
            return 0;
          }
        };
        math.distance = function(p1, p2) {
          return Math.sqrt(math.sqDistance(p1, p2));
        };
        math.sqDistance = function(p1, p2) {
          var dx = p2.x - p1.x;
          var dy = p2.y - p1.y;
          return dx * dx + dy * dy;
        };
        math.qbezierAt = function(p0, p1, p2, t) {
          return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
        };
        math.qbezierPtAt = function(p0, p1, p2, t) {
          return {
            x: math.qbezierAt(p0.x, p1.x, p2.x, t),
            y: math.qbezierAt(p0.y, p1.y, p2.y, t)
          };
        };
        math.makeBoundingBox = function(bb) {
          if (bb.x1 != null && bb.y1 != null) {
            if (bb.x2 != null && bb.y2 != null && bb.x2 >= bb.x1 && bb.y2 >= bb.y1) {
              return {
                x1: bb.x1,
                y1: bb.y1,
                x2: bb.x2,
                y2: bb.y2,
                w: bb.x2 - bb.x1,
                h: bb.y2 - bb.y1
              };
            } else if (bb.w != null && bb.h != null && bb.w >= 0 && bb.h >= 0) {
              return {
                x1: bb.x1,
                y1: bb.y1,
                x2: bb.x1 + bb.w,
                y2: bb.y1 + bb.h,
                w: bb.w,
                h: bb.h
              };
            }
          }
        };
        math.boundingBoxesIntersect = function(bb1, bb2) {
          if (bb1.x1 > bb2.x2) {
            return false;
          }
          if (bb2.x1 > bb1.x2) {
            return false;
          }
          if (bb1.x2 < bb2.x1) {
            return false;
          }
          if (bb2.x2 < bb1.x1) {
            return false;
          }
          if (bb1.y2 < bb2.y1) {
            return false;
          }
          if (bb2.y2 < bb1.y1) {
            return false;
          }
          if (bb1.y1 > bb2.y2) {
            return false;
          }
          if (bb2.y1 > bb1.y2) {
            return false;
          }
          return true;
        };
        math.inBoundingBox = function(bb, x, y) {
          return bb.x1 <= x && x <= bb.x2 && bb.y1 <= y && y <= bb.y2;
        };
        math.pointInBoundingBox = function(bb, pt) {
          return this.inBoundingBox(bb, pt.x, pt.y);
        };
        math.roundRectangleIntersectLine = function(x, y, nodeX, nodeY, width, height, padding) {
          var cornerRadius = this.getRoundRectangleRadius(width, height);
          var halfWidth = width / 2;
          var halfHeight = height / 2;
          var straightLineIntersections;
          {
            var topStartX = nodeX - halfWidth + cornerRadius - padding;
            var topStartY = nodeY - halfHeight - padding;
            var topEndX = nodeX + halfWidth - cornerRadius + padding;
            var topEndY = topStartY;
            straightLineIntersections = this.finiteLinesIntersect(x, y, nodeX, nodeY, topStartX, topStartY, topEndX, topEndY, false);
            if (straightLineIntersections.length > 0) {
              return straightLineIntersections;
            }
          }
          {
            var rightStartX = nodeX + halfWidth + padding;
            var rightStartY = nodeY - halfHeight + cornerRadius - padding;
            var rightEndX = rightStartX;
            var rightEndY = nodeY + halfHeight - cornerRadius + padding;
            straightLineIntersections = this.finiteLinesIntersect(x, y, nodeX, nodeY, rightStartX, rightStartY, rightEndX, rightEndY, false);
            if (straightLineIntersections.length > 0) {
              return straightLineIntersections;
            }
          }
          {
            var bottomStartX = nodeX - halfWidth + cornerRadius - padding;
            var bottomStartY = nodeY + halfHeight + padding;
            var bottomEndX = nodeX + halfWidth - cornerRadius + padding;
            var bottomEndY = bottomStartY;
            straightLineIntersections = this.finiteLinesIntersect(x, y, nodeX, nodeY, bottomStartX, bottomStartY, bottomEndX, bottomEndY, false);
            if (straightLineIntersections.length > 0) {
              return straightLineIntersections;
            }
          }
          {
            var leftStartX = nodeX - halfWidth - padding;
            var leftStartY = nodeY - halfHeight + cornerRadius - padding;
            var leftEndX = leftStartX;
            var leftEndY = nodeY + halfHeight - cornerRadius + padding;
            straightLineIntersections = this.finiteLinesIntersect(x, y, nodeX, nodeY, leftStartX, leftStartY, leftEndX, leftEndY, false);
            if (straightLineIntersections.length > 0) {
              return straightLineIntersections;
            }
          }
          var arcIntersections;
          {
            var topLeftCenterX = nodeX - halfWidth + cornerRadius;
            var topLeftCenterY = nodeY - halfHeight + cornerRadius;
            arcIntersections = this.intersectLineCircle(x, y, nodeX, nodeY, topLeftCenterX, topLeftCenterY, cornerRadius + padding);
            if (arcIntersections.length > 0 && arcIntersections[0] <= topLeftCenterX && arcIntersections[1] <= topLeftCenterY) {
              return [arcIntersections[0], arcIntersections[1]];
            }
          }
          {
            var topRightCenterX = nodeX + halfWidth - cornerRadius;
            var topRightCenterY = nodeY - halfHeight + cornerRadius;
            arcIntersections = this.intersectLineCircle(x, y, nodeX, nodeY, topRightCenterX, topRightCenterY, cornerRadius + padding);
            if (arcIntersections.length > 0 && arcIntersections[0] >= topRightCenterX && arcIntersections[1] <= topRightCenterY) {
              return [arcIntersections[0], arcIntersections[1]];
            }
          }
          {
            var bottomRightCenterX = nodeX + halfWidth - cornerRadius;
            var bottomRightCenterY = nodeY + halfHeight - cornerRadius;
            arcIntersections = this.intersectLineCircle(x, y, nodeX, nodeY, bottomRightCenterX, bottomRightCenterY, cornerRadius + padding);
            if (arcIntersections.length > 0 && arcIntersections[0] >= bottomRightCenterX && arcIntersections[1] >= bottomRightCenterY) {
              return [arcIntersections[0], arcIntersections[1]];
            }
          }
          {
            var bottomLeftCenterX = nodeX - halfWidth + cornerRadius;
            var bottomLeftCenterY = nodeY + halfHeight - cornerRadius;
            arcIntersections = this.intersectLineCircle(x, y, nodeX, nodeY, bottomLeftCenterX, bottomLeftCenterY, cornerRadius + padding);
            if (arcIntersections.length > 0 && arcIntersections[0] <= bottomLeftCenterX && arcIntersections[1] >= bottomLeftCenterY) {
              return [arcIntersections[0], arcIntersections[1]];
            }
          }
          return [];
        };
        math.inLineVicinity = function(x, y, lx1, ly1, lx2, ly2, tolerance) {
          var t = tolerance;
          var x1 = Math.min(lx1, lx2);
          var x2 = Math.max(lx1, lx2);
          var y1 = Math.min(ly1, ly2);
          var y2 = Math.max(ly1, ly2);
          return x1 - t <= x && x <= x2 + t && y1 - t <= y && y <= y2 + t;
        };
        math.inBezierVicinity = function(x, y, x1, y1, x2, y2, x3, y3, tolerance) {
          var bb = {
            x1: Math.min(x1, x3, x2) - tolerance,
            x2: Math.max(x1, x3, x2) + tolerance,
            y1: Math.min(y1, y3, y2) - tolerance,
            y2: Math.max(y1, y3, y2) + tolerance
          };
          if (x < bb.x1 || x > bb.x2 || y < bb.y1 || y > bb.y2) {
            return false;
          } else {
            return true;
          }
        };
        math.solveCubic = function(a, b, c, d, result) {
          b /= a;
          c /= a;
          d /= a;
          var discriminant,
              q,
              r,
              dum1,
              s,
              t,
              term1,
              r13;
          q = (3.0 * c - (b * b)) / 9.0;
          r = -(27.0 * d) + b * (9.0 * c - 2.0 * (b * b));
          r /= 54.0;
          discriminant = q * q * q + r * r;
          result[1] = 0;
          term1 = (b / 3.0);
          if (discriminant > 0) {
            s = r + Math.sqrt(discriminant);
            s = ((s < 0) ? -Math.pow(-s, (1.0 / 3.0)) : Math.pow(s, (1.0 / 3.0)));
            t = r - Math.sqrt(discriminant);
            t = ((t < 0) ? -Math.pow(-t, (1.0 / 3.0)) : Math.pow(t, (1.0 / 3.0)));
            result[0] = -term1 + s + t;
            term1 += (s + t) / 2.0;
            result[4] = result[2] = -term1;
            term1 = Math.sqrt(3.0) * (-t + s) / 2;
            result[3] = term1;
            result[5] = -term1;
            return;
          }
          result[5] = result[3] = 0;
          if (discriminant === 0) {
            r13 = ((r < 0) ? -Math.pow(-r, (1.0 / 3.0)) : Math.pow(r, (1.0 / 3.0)));
            result[0] = -term1 + 2.0 * r13;
            result[4] = result[2] = -(r13 + term1);
            return;
          }
          q = -q;
          dum1 = q * q * q;
          dum1 = Math.acos(r / Math.sqrt(dum1));
          r13 = 2.0 * Math.sqrt(q);
          result[0] = -term1 + r13 * Math.cos(dum1 / 3.0);
          result[2] = -term1 + r13 * Math.cos((dum1 + 2.0 * Math.PI) / 3.0);
          result[4] = -term1 + r13 * Math.cos((dum1 + 4.0 * Math.PI) / 3.0);
          return;
        };
        math.sqDistanceToQuadraticBezier = function(x, y, x1, y1, x2, y2, x3, y3) {
          var a = 1.0 * x1 * x1 - 4 * x1 * x2 + 2 * x1 * x3 + 4 * x2 * x2 - 4 * x2 * x3 + x3 * x3 + y1 * y1 - 4 * y1 * y2 + 2 * y1 * y3 + 4 * y2 * y2 - 4 * y2 * y3 + y3 * y3;
          var b = 1.0 * 9 * x1 * x2 - 3 * x1 * x1 - 3 * x1 * x3 - 6 * x2 * x2 + 3 * x2 * x3 + 9 * y1 * y2 - 3 * y1 * y1 - 3 * y1 * y3 - 6 * y2 * y2 + 3 * y2 * y3;
          var c = 1.0 * 3 * x1 * x1 - 6 * x1 * x2 + x1 * x3 - x1 * x + 2 * x2 * x2 + 2 * x2 * x - x3 * x + 3 * y1 * y1 - 6 * y1 * y2 + y1 * y3 - y1 * y + 2 * y2 * y2 + 2 * y2 * y - y3 * y;
          var d = 1.0 * x1 * x2 - x1 * x1 + x1 * x - x2 * x + y1 * y2 - y1 * y1 + y1 * y - y2 * y;
          var roots = [];
          this.solveCubic(a, b, c, d, roots);
          var zeroThreshold = 0.0000001;
          var params = [];
          for (var index = 0; index < 6; index += 2) {
            if (Math.abs(roots[index + 1]) < zeroThreshold && roots[index] >= 0 && roots[index] <= 1.0) {
              params.push(roots[index]);
            }
          }
          params.push(1.0);
          params.push(0.0);
          var minDistanceSquared = -1;
          var closestParam;
          var curX,
              curY,
              distSquared;
          for (var i = 0; i < params.length; i++) {
            curX = Math.pow(1.0 - params[i], 2.0) * x1 + 2.0 * (1 - params[i]) * params[i] * x2 + params[i] * params[i] * x3;
            curY = Math.pow(1 - params[i], 2.0) * y1 + 2 * (1.0 - params[i]) * params[i] * y2 + params[i] * params[i] * y3;
            distSquared = Math.pow(curX - x, 2) + Math.pow(curY - y, 2);
            if (minDistanceSquared >= 0) {
              if (distSquared < minDistanceSquared) {
                minDistanceSquared = distSquared;
                closestParam = params[i];
              }
            } else {
              minDistanceSquared = distSquared;
              closestParam = params[i];
            }
          }
          return minDistanceSquared;
        };
        math.sqDistanceToFiniteLine = function(x, y, x1, y1, x2, y2) {
          var offset = [x - x1, y - y1];
          var line = [x2 - x1, y2 - y1];
          var lineSq = line[0] * line[0] + line[1] * line[1];
          var hypSq = offset[0] * offset[0] + offset[1] * offset[1];
          var dotProduct = offset[0] * line[0] + offset[1] * line[1];
          var adjSq = dotProduct * dotProduct / lineSq;
          if (dotProduct < 0) {
            return hypSq;
          }
          if (adjSq > lineSq) {
            return (x - x2) * (x - x2) + (y - y2) * (y - y2);
          }
          return hypSq - adjSq;
        };
        math.pointInsidePolygonPoints = function(x, y, points) {
          var x1,
              y1,
              x2,
              y2;
          var y3;
          var up = 0;
          var down = 0;
          for (var i = 0; i < points.length / 2; i++) {
            x1 = points[i * 2];
            y1 = points[i * 2 + 1];
            if (i + 1 < points.length / 2) {
              x2 = points[(i + 1) * 2];
              y2 = points[(i + 1) * 2 + 1];
            } else {
              x2 = points[(i + 1 - points.length / 2) * 2];
              y2 = points[(i + 1 - points.length / 2) * 2 + 1];
            }
            if (x1 == x && x2 == x) {} else if ((x1 >= x && x >= x2) || (x1 <= x && x <= x2)) {
              y3 = (x - x1) / (x2 - x1) * (y2 - y1) + y1;
              if (y3 > y) {
                up++;
              }
              if (y3 < y) {
                down++;
              }
            } else {
              continue;
            }
          }
          if (up % 2 === 0) {
            return false;
          } else {
            return true;
          }
        };
        math.pointInsidePolygon = function(x, y, basePoints, centerX, centerY, width, height, direction, padding) {
          var transformedPoints = new Array(basePoints.length);
          var angle;
          if (direction[0] != null) {
            angle = Math.atan(direction[1] / direction[0]);
            if (direction[0] < 0) {
              angle = angle + Math.PI / 2;
            } else {
              angle = -angle - Math.PI / 2;
            }
          } else {
            angle = direction;
          }
          var cos = Math.cos(-angle);
          var sin = Math.sin(-angle);
          for (var i = 0; i < transformedPoints.length / 2; i++) {
            transformedPoints[i * 2] = width / 2 * (basePoints[i * 2] * cos - basePoints[i * 2 + 1] * sin);
            transformedPoints[i * 2 + 1] = height / 2 * (basePoints[i * 2 + 1] * cos + basePoints[i * 2] * sin);
            transformedPoints[i * 2] += centerX;
            transformedPoints[i * 2 + 1] += centerY;
          }
          var points;
          if (padding > 0) {
            var expandedLineSet = this.expandPolygon(transformedPoints, -padding);
            points = this.joinLines(expandedLineSet);
          } else {
            points = transformedPoints;
          }
          return math.pointInsidePolygonPoints(x, y, points);
        };
        math.joinLines = function(lineSet) {
          var vertices = new Array(lineSet.length / 2);
          var currentLineStartX,
              currentLineStartY,
              currentLineEndX,
              currentLineEndY;
          var nextLineStartX,
              nextLineStartY,
              nextLineEndX,
              nextLineEndY;
          for (var i = 0; i < lineSet.length / 4; i++) {
            currentLineStartX = lineSet[i * 4];
            currentLineStartY = lineSet[i * 4 + 1];
            currentLineEndX = lineSet[i * 4 + 2];
            currentLineEndY = lineSet[i * 4 + 3];
            if (i < lineSet.length / 4 - 1) {
              nextLineStartX = lineSet[(i + 1) * 4];
              nextLineStartY = lineSet[(i + 1) * 4 + 1];
              nextLineEndX = lineSet[(i + 1) * 4 + 2];
              nextLineEndY = lineSet[(i + 1) * 4 + 3];
            } else {
              nextLineStartX = lineSet[0];
              nextLineStartY = lineSet[1];
              nextLineEndX = lineSet[2];
              nextLineEndY = lineSet[3];
            }
            var intersection = this.finiteLinesIntersect(currentLineStartX, currentLineStartY, currentLineEndX, currentLineEndY, nextLineStartX, nextLineStartY, nextLineEndX, nextLineEndY, true);
            vertices[i * 2] = intersection[0];
            vertices[i * 2 + 1] = intersection[1];
          }
          return vertices;
        };
        math.expandPolygon = function(points, pad) {
          var expandedLineSet = new Array(points.length * 2);
          var currentPointX,
              currentPointY,
              nextPointX,
              nextPointY;
          for (var i = 0; i < points.length / 2; i++) {
            currentPointX = points[i * 2];
            currentPointY = points[i * 2 + 1];
            if (i < points.length / 2 - 1) {
              nextPointX = points[(i + 1) * 2];
              nextPointY = points[(i + 1) * 2 + 1];
            } else {
              nextPointX = points[0];
              nextPointY = points[1];
            }
            var offsetX = (nextPointY - currentPointY);
            var offsetY = -(nextPointX - currentPointX);
            var offsetLength = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
            var normalizedOffsetX = offsetX / offsetLength;
            var normalizedOffsetY = offsetY / offsetLength;
            expandedLineSet[i * 4] = currentPointX + normalizedOffsetX * pad;
            expandedLineSet[i * 4 + 1] = currentPointY + normalizedOffsetY * pad;
            expandedLineSet[i * 4 + 2] = nextPointX + normalizedOffsetX * pad;
            expandedLineSet[i * 4 + 3] = nextPointY + normalizedOffsetY * pad;
          }
          return expandedLineSet;
        };
        math.intersectLineEllipse = function(x, y, centerX, centerY, ellipseWradius, ellipseHradius) {
          var dispX = centerX - x;
          var dispY = centerY - y;
          dispX /= ellipseWradius;
          dispY /= ellipseHradius;
          var len = Math.sqrt(dispX * dispX + dispY * dispY);
          var newLength = len - 1;
          if (newLength < 0) {
            return [];
          }
          var lenProportion = newLength / len;
          return [(centerX - x) * lenProportion + x, (centerY - y) * lenProportion + y];
        };
        math.intersectLineCircle = function(x1, y1, x2, y2, centerX, centerY, radius) {
          var d = [x2 - x1, y2 - y1];
          var c = [centerX, centerY];
          var f = [x1 - centerX, y1 - centerY];
          var a = d[0] * d[0] + d[1] * d[1];
          var b = 2 * (f[0] * d[0] + f[1] * d[1]);
          var c = (f[0] * f[0] + f[1] * f[1]) - radius * radius;
          var discriminant = b * b - 4 * a * c;
          if (discriminant < 0) {
            return [];
          }
          var t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
          var t2 = (-b - Math.sqrt(discriminant)) / (2 * a);
          var tMin = Math.min(t1, t2);
          var tMax = Math.max(t1, t2);
          var inRangeParams = [];
          if (tMin >= 0 && tMin <= 1) {
            inRangeParams.push(tMin);
          }
          if (tMax >= 0 && tMax <= 1) {
            inRangeParams.push(tMax);
          }
          if (inRangeParams.length === 0) {
            return [];
          }
          var nearIntersectionX = inRangeParams[0] * d[0] + x1;
          var nearIntersectionY = inRangeParams[0] * d[1] + y1;
          if (inRangeParams.length > 1) {
            if (inRangeParams[0] == inRangeParams[1]) {
              return [nearIntersectionX, nearIntersectionY];
            } else {
              var farIntersectionX = inRangeParams[1] * d[0] + x1;
              var farIntersectionY = inRangeParams[1] * d[1] + y1;
              return [nearIntersectionX, nearIntersectionY, farIntersectionX, farIntersectionY];
            }
          } else {
            return [nearIntersectionX, nearIntersectionY];
          }
        };
        math.findCircleNearPoint = function(centerX, centerY, radius, farX, farY) {
          var displacementX = farX - centerX;
          var displacementY = farY - centerY;
          var distance = Math.sqrt(displacementX * displacementX + displacementY * displacementY);
          var unitDisplacementX = displacementX / distance;
          var unitDisplacementY = displacementY / distance;
          return [centerX + unitDisplacementX * radius, centerY + unitDisplacementY * radius];
        };
        math.findMaxSqDistanceToOrigin = function(points) {
          var maxSqDistance = 0.000001;
          var sqDistance;
          for (var i = 0; i < points.length / 2; i++) {
            sqDistance = points[i * 2] * points[i * 2] + points[i * 2 + 1] * points[i * 2 + 1];
            if (sqDistance > maxSqDistance) {
              maxSqDistance = sqDistance;
            }
          }
          return maxSqDistance;
        };
        math.finiteLinesIntersect = function(x1, y1, x2, y2, x3, y3, x4, y4, infiniteLines) {
          var ua_t = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
          var ub_t = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);
          var u_b = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
          if (u_b !== 0) {
            var ua = ua_t / u_b;
            var ub = ub_t / u_b;
            if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
              return [x1 + ua * (x2 - x1), y1 + ua * (y2 - y1)];
            } else {
              if (!infiniteLines) {
                return [];
              } else {
                return [x1 + ua * (x2 - x1), y1 + ua * (y2 - y1)];
              }
            }
          } else {
            if (ua_t === 0 || ub_t === 0) {
              if ([x1, x2, x4].sort()[1] === x4) {
                return [x4, y4];
              }
              if ([x1, x2, x3].sort()[1] === x3) {
                return [x3, y3];
              }
              if ([x3, x4, x2].sort()[1] === x2) {
                return [x2, y2];
              }
              return [];
            } else {
              return [];
            }
          }
        };
        math.polygonIntersectLine = function(x, y, basePoints, centerX, centerY, width, height, padding) {
          var intersections = [];
          var intersection;
          var transformedPoints = new Array(basePoints.length);
          for (var i = 0; i < transformedPoints.length / 2; i++) {
            transformedPoints[i * 2] = basePoints[i * 2] * width + centerX;
            transformedPoints[i * 2 + 1] = basePoints[i * 2 + 1] * height + centerY;
          }
          var points;
          if (padding > 0) {
            var expandedLineSet = math.expandPolygon(transformedPoints, -padding);
            points = math.joinLines(expandedLineSet);
          } else {
            points = transformedPoints;
          }
          var currentX,
              currentY,
              nextX,
              nextY;
          for (var i = 0; i < points.length / 2; i++) {
            currentX = points[i * 2];
            currentY = points[i * 2 + 1];
            if (i < points.length / 2 - 1) {
              nextX = points[(i + 1) * 2];
              nextY = points[(i + 1) * 2 + 1];
            } else {
              nextX = points[0];
              nextY = points[1];
            }
            intersection = this.finiteLinesIntersect(x, y, centerX, centerY, currentX, currentY, nextX, nextY);
            if (intersection.length !== 0) {
              intersections.push(intersection[0], intersection[1]);
            }
          }
          return intersections;
        };
        math.shortenIntersection = function(intersection, offset, amount) {
          var disp = [intersection[0] - offset[0], intersection[1] - offset[1]];
          var length = Math.sqrt(disp[0] * disp[0] + disp[1] * disp[1]);
          var lenRatio = (length - amount) / length;
          if (lenRatio < 0) {
            lenRatio = 0.00001;
          }
          return [offset[0] + lenRatio * disp[0], offset[1] + lenRatio * disp[1]];
        };
        math.generateUnitNgonPointsFitToSquare = function(sides, rotationRadians) {
          var points = math.generateUnitNgonPoints(sides, rotationRadians);
          points = math.fitPolygonToSquare(points);
          return points;
        };
        math.fitPolygonToSquare = function(points) {
          var x,
              y;
          var sides = points.length / 2;
          var minX = Infinity,
              minY = Infinity,
              maxX = -Infinity,
              maxY = -Infinity;
          for (var i = 0; i < sides; i++) {
            x = points[2 * i];
            y = points[2 * i + 1];
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
          }
          var sx = 2 / (maxX - minX);
          var sy = 2 / (maxY - minY);
          for (var i = 0; i < sides; i++) {
            x = points[2 * i] = points[2 * i] * sx;
            y = points[2 * i + 1] = points[2 * i + 1] * sy;
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
          }
          if (minY < -1) {
            for (var i = 0; i < sides; i++) {
              y = points[2 * i + 1] = points[2 * i + 1] + (-1 - minY);
            }
          }
          return points;
        };
        math.generateUnitNgonPoints = function(sides, rotationRadians) {
          var increment = 1.0 / sides * 2 * Math.PI;
          var startAngle = sides % 2 === 0 ? Math.PI / 2.0 + increment / 2.0 : Math.PI / 2.0;
          startAngle += rotationRadians;
          var points = new Array(sides * 2);
          var currentAngle,
              x,
              y;
          for (var i = 0; i < sides; i++) {
            currentAngle = i * increment + startAngle;
            x = points[2 * i] = Math.cos(currentAngle);
            y = points[2 * i + 1] = Math.sin(-currentAngle);
          }
          return points;
        };
        math.getRoundRectangleRadius = function(width, height) {
          return Math.min(width / 4, height / 4, 8);
        };
        module.exports = math;
      }, {}],
      80: [function(_dereq_, module, exports) {
        'use strict';
        var STATE_PENDING = 0;
        var STATE_FULFILLED = 1;
        var STATE_REJECTED = 2;
        var api = function(executor) {
          if (!(this instanceof api))
            return new api(executor);
          this.id = "Thenable/1.0.7";
          this.state = STATE_PENDING;
          this.fulfillValue = undefined;
          this.rejectReason = undefined;
          this.onFulfilled = [];
          this.onRejected = [];
          this.proxy = {then: this.then.bind(this)};
          if (typeof executor === "function")
            executor.call(this, this.fulfill.bind(this), this.reject.bind(this));
        };
        api.prototype = {
          fulfill: function(value) {
            return deliver(this, STATE_FULFILLED, "fulfillValue", value);
          },
          reject: function(value) {
            return deliver(this, STATE_REJECTED, "rejectReason", value);
          },
          then: function(onFulfilled, onRejected) {
            var curr = this;
            var next = new api();
            curr.onFulfilled.push(resolver(onFulfilled, next, "fulfill"));
            curr.onRejected.push(resolver(onRejected, next, "reject"));
            execute(curr);
            return next.proxy;
          }
        };
        var deliver = function(curr, state, name, value) {
          if (curr.state === STATE_PENDING) {
            curr.state = state;
            curr[name] = value;
            execute(curr);
          }
          return curr;
        };
        var execute = function(curr) {
          if (curr.state === STATE_FULFILLED)
            execute_handlers(curr, "onFulfilled", curr.fulfillValue);
          else if (curr.state === STATE_REJECTED)
            execute_handlers(curr, "onRejected", curr.rejectReason);
        };
        var execute_handlers = function(curr, name, value) {
          if (curr[name].length === 0)
            return;
          var handlers = curr[name];
          curr[name] = [];
          var func = function() {
            for (var i = 0; i < handlers.length; i++)
              handlers[i](value);
          };
          if (typeof setImmediate === "function")
            setImmediate(func);
          else
            setTimeout(func, 0);
        };
        var resolver = function(cb, next, method) {
          return function(value) {
            if (typeof cb !== "function")
              next[method].call(next, value);
            else {
              var result;
              try {
                result = cb(value);
              } catch (e) {
                next.reject(e);
                return;
              }
              resolve(next, result);
            }
          };
        };
        var resolve = function(promise, x) {
          if (promise === x || promise.proxy === x) {
            promise.reject(new TypeError("cannot resolve promise with itself"));
            return;
          }
          var then;
          if ((typeof x === "object" && x !== null) || typeof x === "function") {
            try {
              then = x.then;
            } catch (e) {
              promise.reject(e);
              return;
            }
          }
          if (typeof then === "function") {
            var resolved = false;
            try {
              then.call(x, function(y) {
                if (resolved)
                  return;
                resolved = true;
                if (y === x)
                  promise.reject(new TypeError("circular thenable chain"));
                else
                  resolve(promise, y);
              }, function(r) {
                if (resolved)
                  return;
                resolved = true;
                promise.reject(r);
              });
            } catch (e) {
              if (!resolved)
                promise.reject(e);
            }
            return;
          }
          promise.fulfill(x);
        };
        var Promise = typeof Promise === 'undefined' ? api : Promise;
        Promise.all = Promise.all || function(ps) {
          return new Promise(function(resolveAll, rejectAll) {
            var vals = new Array(ps.length);
            var doneCount = 0;
            var fulfill = function(i, val) {
              vals[i] = val;
              doneCount++;
              if (doneCount === ps.length) {
                resolveAll(vals);
              }
            };
            for (var i = 0; i < ps.length; i++) {
              (function(i) {
                var p = ps[i];
                var isPromise = p.then != null;
                if (isPromise) {
                  p.then(function(val) {
                    fulfill(i, val);
                  }, function(err) {
                    rejectAll(err);
                  });
                } else {
                  var val = p;
                  fulfill(i, val);
                }
              })(i);
            }
          });
        };
        module.exports = Promise;
      }, {}],
      81: [function(_dereq_, module, exports) {
        'use strict';
        var is = _dereq_('./is');
        var util = _dereq_('./util');
        var Selector = function(onlyThisGroup, selector) {
          if (!(this instanceof Selector)) {
            return new Selector(onlyThisGroup, selector);
          }
          if (selector === undefined && onlyThisGroup !== undefined) {
            selector = onlyThisGroup;
            onlyThisGroup = undefined;
          }
          var self = this;
          self._private = {
            selectorText: null,
            invalid: true
          };
          if (!selector || (is.string(selector) && selector.match(/^\s*$/))) {
            if (onlyThisGroup == null) {
              self.length = 0;
            } else {
              self[0] = newQuery();
              self[0].group = onlyThisGroup;
              self.length = 1;
            }
          } else if (is.elementOrCollection(selector)) {
            var collection = selector.collection();
            self[0] = newQuery();
            self[0].collection = collection;
            self.length = 1;
          } else if (is.fn(selector)) {
            self[0] = newQuery();
            self[0].filter = selector;
            self.length = 1;
          } else if (is.string(selector)) {
            var currentSubject = null;
            var newQuery = function() {
              return {
                classes: [],
                colonSelectors: [],
                data: [],
                group: null,
                ids: [],
                meta: [],
                collection: null,
                filter: null,
                parent: null,
                ancestor: null,
                subject: null,
                child: null,
                descendant: null
              };
            };
            var tokens = {
              metaChar: '[\\!\\"\\#\\$\\%\\&\\\'\\(\\)\\*\\+\\,\\.\\/\\:\\;\\<\\=\\>\\?\\@\\[\\]\\^\\`\\{\\|\\}\\~]',
              comparatorOp: '=|\\!=|>|>=|<|<=|\\$=|\\^=|\\*=',
              boolOp: '\\?|\\!|\\^',
              string: '"(?:\\\\"|[^"])+"' + '|' + "'(?:\\\\'|[^'])+'",
              number: util.regex.number,
              meta: 'degree|indegree|outdegree',
              separator: '\\s*,\\s*',
              descendant: '\\s+',
              child: '\\s+>\\s+',
              subject: '\\$'
            };
            tokens.variable = '(?:[\\w-]|(?:\\\\' + tokens.metaChar + '))+';
            tokens.value = tokens.string + '|' + tokens.number;
            tokens.className = tokens.variable;
            tokens.id = tokens.variable;
            var cleanMetaChars = function(str) {
              return str.replace(new RegExp('\\\\(' + tokens.metaChar + ')', 'g'), function(match, $1, offset, original) {
                return $1;
              });
            };
            var ops = tokens.comparatorOp.split('|');
            for (var i = 0; i < ops.length; i++) {
              var op = ops[i];
              tokens.comparatorOp += '|@' + op;
            }
            var ops = tokens.comparatorOp.split('|');
            for (var i = 0; i < ops.length; i++) {
              var op = ops[i];
              if (op.indexOf('!') >= 0) {
                continue;
              }
              if (op === '=') {
                continue;
              }
              tokens.comparatorOp += '|\\!' + op;
            }
            var exprs = [{
              name: 'group',
              query: true,
              regex: '(node|edge|\\*)',
              populate: function(group) {
                this.group = group == "*" ? group : group + 's';
              }
            }, {
              name: 'state',
              query: true,
              regex: '(:selected|:unselected|:locked|:unlocked|:visible|:hidden|:transparent|:grabbed|:free|:removed|:inside|:grabbable|:ungrabbable|:animated|:unanimated|:selectable|:unselectable|:orphan|:nonorphan|:parent|:child|:loop|:simple|:active|:inactive|:touch|:backgrounding|:nonbackgrounding)',
              populate: function(state) {
                this.colonSelectors.push(state);
              }
            }, {
              name: 'id',
              query: true,
              regex: '\\#(' + tokens.id + ')',
              populate: function(id) {
                this.ids.push(cleanMetaChars(id));
              }
            }, {
              name: 'className',
              query: true,
              regex: '\\.(' + tokens.className + ')',
              populate: function(className) {
                this.classes.push(cleanMetaChars(className));
              }
            }, {
              name: 'dataExists',
              query: true,
              regex: '\\[\\s*(' + tokens.variable + ')\\s*\\]',
              populate: function(variable) {
                this.data.push({field: cleanMetaChars(variable)});
              }
            }, {
              name: 'dataCompare',
              query: true,
              regex: '\\[\\s*(' + tokens.variable + ')\\s*(' + tokens.comparatorOp + ')\\s*(' + tokens.value + ')\\s*\\]',
              populate: function(variable, comparatorOp, value) {
                var valueIsString = new RegExp('^' + tokens.string + '$').exec(value) != null;
                if (valueIsString) {
                  value = value.substring(1, value.length - 1);
                } else {
                  value = parseFloat(value);
                }
                this.data.push({
                  field: cleanMetaChars(variable),
                  operator: comparatorOp,
                  value: value
                });
              }
            }, {
              name: 'dataBool',
              query: true,
              regex: '\\[\\s*(' + tokens.boolOp + ')\\s*(' + tokens.variable + ')\\s*\\]',
              populate: function(boolOp, variable) {
                this.data.push({
                  field: cleanMetaChars(variable),
                  operator: boolOp
                });
              }
            }, {
              name: 'metaCompare',
              query: true,
              regex: '\\[\\[\\s*(' + tokens.meta + ')\\s*(' + tokens.comparatorOp + ')\\s*(' + tokens.number + ')\\s*\\]\\]',
              populate: function(meta, comparatorOp, number) {
                this.meta.push({
                  field: cleanMetaChars(meta),
                  operator: comparatorOp,
                  value: parseFloat(number)
                });
              }
            }, {
              name: 'nextQuery',
              separator: true,
              regex: tokens.separator,
              populate: function() {
                self[++i] = newQuery();
                currentSubject = null;
              }
            }, {
              name: 'child',
              separator: true,
              regex: tokens.child,
              populate: function() {
                var childQuery = newQuery();
                childQuery.parent = this;
                childQuery.subject = currentSubject;
                self[i] = childQuery;
              }
            }, {
              name: 'descendant',
              separator: true,
              regex: tokens.descendant,
              populate: function() {
                var descendantQuery = newQuery();
                descendantQuery.ancestor = this;
                descendantQuery.subject = currentSubject;
                self[i] = descendantQuery;
              }
            }, {
              name: 'subject',
              modifier: true,
              regex: tokens.subject,
              populate: function() {
                if (currentSubject != null && this.subject != this) {
                  util.error('Redefinition of subject in selector `' + selector + '`');
                  return false;
                }
                currentSubject = this;
                this.subject = this;
              }
            }];
            self._private.selectorText = selector;
            var remaining = selector;
            var i = 0;
            var consumeExpr = function(expectation) {
              var expr;
              var match;
              var name;
              for (var j = 0; j < exprs.length; j++) {
                var e = exprs[j];
                var n = e.name;
                if (is.fn(expectation) && !expectation(n, e)) {
                  continue;
                }
                var m = remaining.match(new RegExp('^' + e.regex));
                if (m != null) {
                  match = m;
                  expr = e;
                  name = n;
                  var consumed = m[0];
                  remaining = remaining.substring(consumed.length);
                  break;
                }
              }
              return {
                expr: expr,
                match: match,
                name: name
              };
            };
            var consumeWhitespace = function() {
              var match = remaining.match(/^\s+/);
              if (match) {
                var consumed = match[0];
                remaining = remaining.substring(consumed.length);
              }
            };
            self[0] = newQuery();
            consumeWhitespace();
            for (; ; ) {
              var check = consumeExpr();
              if (check.expr == null) {
                util.error('The selector `' + selector + '`is invalid');
                return;
              } else {
                var args = [];
                for (var j = 1; j < check.match.length; j++) {
                  args.push(check.match[j]);
                }
                var ret = check.expr.populate.apply(self[i], args);
                if (ret === false) {
                  return;
                }
              }
              if (remaining.match(/^\s*$/)) {
                break;
              }
            }
            self.length = i + 1;
            for (var j = 0; j < self.length; j++) {
              var query = self[j];
              if (query.subject != null) {
                for (; ; ) {
                  if (query.subject == query) {
                    break;
                  }
                  if (query.parent != null) {
                    var parent = query.parent;
                    var child = query;
                    child.parent = null;
                    parent.child = child;
                    query = parent;
                  } else if (query.ancestor != null) {
                    var ancestor = query.ancestor;
                    var descendant = query;
                    descendant.ancestor = null;
                    ancestor.descendant = descendant;
                    query = ancestor;
                  } else {
                    util.error('When adjusting references for the selector `' + query + '`, neither parent nor ancestor was found');
                    break;
                  }
                }
                self[j] = query.subject;
              }
            }
            if (onlyThisGroup != null) {
              for (var j = 0; j < self.length; j++) {
                if (self[j].group != null && self[j].group != onlyThisGroup) {
                  util.error('Group `' + self[j].group + '` conflicts with implicit group `' + onlyThisGroup + '` in selector `' + selector + '`');
                  return;
                }
                self[j].group = onlyThisGroup;
              }
            }
          } else {
            util.error('A selector must be created from a string; found ' + selector);
            return;
          }
          self._private.invalid = false;
        };
        var selfn = Selector.prototype;
        selfn.size = function() {
          return this.length;
        };
        selfn.eq = function(i) {
          return this[i];
        };
        var queryMatches = function(query, element) {
          if (query.group != null && query.group != '*' && query.group != element._private.group) {
            return false;
          }
          var cy = element.cy();
          var allColonSelectorsMatch = true;
          for (var k = 0; k < query.colonSelectors.length; k++) {
            var sel = query.colonSelectors[k];
            switch (sel) {
              case ':selected':
                allColonSelectorsMatch = element.selected();
                break;
              case ':unselected':
                allColonSelectorsMatch = !element.selected();
                break;
              case ':selectable':
                allColonSelectorsMatch = element.selectable();
                break;
              case ':unselectable':
                allColonSelectorsMatch = !element.selectable();
                break;
              case ':locked':
                allColonSelectorsMatch = element.locked();
                break;
              case ':unlocked':
                allColonSelectorsMatch = !element.locked();
                break;
              case ':visible':
                allColonSelectorsMatch = element.visible();
                break;
              case ':hidden':
                allColonSelectorsMatch = !element.visible();
                break;
              case ':transparent':
                allColonSelectorsMatch = element.transparent();
                break;
              case ':grabbed':
                allColonSelectorsMatch = element.grabbed();
                break;
              case ':free':
                allColonSelectorsMatch = !element.grabbed();
                break;
              case ':removed':
                allColonSelectorsMatch = element.removed();
                break;
              case ':inside':
                allColonSelectorsMatch = !element.removed();
                break;
              case ':grabbable':
                allColonSelectorsMatch = element.grabbable();
                break;
              case ':ungrabbable':
                allColonSelectorsMatch = !element.grabbable();
                break;
              case ':animated':
                allColonSelectorsMatch = element.animated();
                break;
              case ':unanimated':
                allColonSelectorsMatch = !element.animated();
                break;
              case ':parent':
                allColonSelectorsMatch = element.isNode() && element.children().nonempty();
                break;
              case ':child':
              case ':nonorphan':
                allColonSelectorsMatch = element.isNode() && element.parent().nonempty();
                break;
              case ':orphan':
                allColonSelectorsMatch = element.isNode() && element.parent().empty();
                break;
              case ':loop':
                allColonSelectorsMatch = element.isEdge() && element.data('source') === element.data('target');
                break;
              case ':simple':
                allColonSelectorsMatch = element.isEdge() && element.data('source') !== element.data('target');
                break;
              case ':active':
                allColonSelectorsMatch = element.active();
                break;
              case ':inactive':
                allColonSelectorsMatch = !element.active();
                break;
              case ':touch':
                allColonSelectorsMatch = is.touch();
                break;
              case ':backgrounding':
                allColonSelectorsMatch = element.backgrounding();
                break;
              case ':nonbackgrounding':
                allColonSelectorsMatch = !element.backgrounding();
                break;
            }
            if (!allColonSelectorsMatch)
              break;
          }
          if (!allColonSelectorsMatch)
            return false;
          var allIdsMatch = true;
          for (var k = 0; k < query.ids.length; k++) {
            var id = query.ids[k];
            var actualId = element._private.data.id;
            allIdsMatch = allIdsMatch && (id == actualId);
            if (!allIdsMatch)
              break;
          }
          if (!allIdsMatch)
            return false;
          var allClassesMatch = true;
          for (var k = 0; k < query.classes.length; k++) {
            var cls = query.classes[k];
            allClassesMatch = allClassesMatch && element.hasClass(cls);
            if (!allClassesMatch)
              break;
          }
          if (!allClassesMatch)
            return false;
          var operandsMatch = function(params) {
            var allDataMatches = true;
            for (var k = 0; k < query[params.name].length; k++) {
              var data = query[params.name][k];
              var operator = data.operator;
              var value = data.value;
              var field = data.field;
              var matches;
              if (operator != null && value != null) {
                var fieldVal = params.fieldValue(field);
                var fieldStr = !is.string(fieldVal) && !is.number(fieldVal) ? '' : '' + fieldVal;
                var valStr = '' + value;
                var caseInsensitive = false;
                if (operator.indexOf('@') >= 0) {
                  fieldStr = fieldStr.toLowerCase();
                  valStr = valStr.toLowerCase();
                  operator = operator.replace('@', '');
                  caseInsensitive = true;
                }
                var notExpr = false;
                var handledNotExpr = false;
                if (operator.indexOf('!') >= 0) {
                  operator = operator.replace('!', '');
                  notExpr = true;
                }
                if (caseInsensitive) {
                  value = valStr.toLowerCase();
                  fieldVal = fieldStr.toLowerCase();
                }
                switch (operator) {
                  case '*=':
                    matches = fieldStr.search(valStr) >= 0;
                    break;
                  case '$=':
                    matches = new RegExp(valStr + '$').exec(fieldStr) != null;
                    break;
                  case '^=':
                    matches = new RegExp('^' + valStr).exec(fieldStr) != null;
                    break;
                  case '=':
                    matches = fieldVal === value;
                    break;
                  case '!=':
                    matches = fieldVal !== value;
                    break;
                  case '>':
                    matches = !notExpr ? fieldVal > value : fieldVal <= value;
                    handledNotExpr = true;
                    break;
                  case '>=':
                    matches = !notExpr ? fieldVal >= value : fieldVal < value;
                    handledNotExpr = true;
                    break;
                  case '<':
                    matches = !notExpr ? fieldVal < value : fieldVal >= value;
                    handledNotExpr = true;
                    break;
                  case '<=':
                    matches = !notExpr ? fieldVal <= value : fieldVal > value;
                    handledNotExpr = true;
                    break;
                  default:
                    matches = false;
                    break;
                }
              } else if (operator != null) {
                switch (operator) {
                  case '?':
                    matches = params.fieldTruthy(field);
                    break;
                  case '!':
                    matches = !params.fieldTruthy(field);
                    break;
                  case '^':
                    matches = params.fieldUndefined(field);
                    break;
                }
              } else {
                matches = !params.fieldUndefined(field);
              }
              if (notExpr && !handledNotExpr) {
                matches = !matches;
                handledNotExpr = true;
              }
              if (!matches) {
                allDataMatches = false;
                break;
              }
            }
            return allDataMatches;
          };
          var allDataMatches = operandsMatch({
            name: 'data',
            fieldValue: function(field) {
              return element._private.data[field];
            },
            fieldRef: function(field) {
              return 'element._private.data.' + field;
            },
            fieldUndefined: function(field) {
              return element._private.data[field] === undefined;
            },
            fieldTruthy: function(field) {
              if (element._private.data[field]) {
                return true;
              }
              return false;
            }
          });
          if (!allDataMatches) {
            return false;
          }
          var allMetaMatches = operandsMatch({
            name: 'meta',
            fieldValue: function(field) {
              return element[field]();
            },
            fieldRef: function(field) {
              return 'element.' + field + '()';
            },
            fieldUndefined: function(field) {
              return element[field]() == null;
            },
            fieldTruthy: function(field) {
              if (element[field]()) {
                return true;
              }
              return false;
            }
          });
          if (!allMetaMatches) {
            return false;
          }
          if (query.collection != null) {
            var matchesAny = query.collection._private.ids[element.id()] != null;
            if (!matchesAny) {
              return false;
            }
          }
          if (query.filter != null && element.collection().filter(query.filter).size() === 0) {
            return false;
          }
          var confirmRelations = function(query, elements) {
            if (query != null) {
              var matches = false;
              if (!cy.hasCompoundNodes()) {
                return false;
              }
              elements = elements();
              for (var i = 0; i < elements.length; i++) {
                if (queryMatches(query, elements[i])) {
                  matches = true;
                  break;
                }
              }
              return matches;
            } else {
              return true;
            }
          };
          if (!confirmRelations(query.parent, function() {
            return element.parent();
          })) {
            return false;
          }
          if (!confirmRelations(query.ancestor, function() {
            return element.parents();
          })) {
            return false;
          }
          if (!confirmRelations(query.child, function() {
            return element.children();
          })) {
            return false;
          }
          if (!confirmRelations(query.descendant, function() {
            return element.descendants();
          })) {
            return false;
          }
          return true;
        };
        selfn.filter = function(collection) {
          var self = this;
          var cy = collection.cy();
          if (self._private.invalid) {
            return cy.collection();
          }
          var selectorFunction = function(i, element) {
            for (var j = 0; j < self.length; j++) {
              var query = self[j];
              if (queryMatches(query, element)) {
                return true;
              }
            }
            return false;
          };
          if (self._private.selectorText == null) {
            selectorFunction = function() {
              return true;
            };
          }
          var filteredCollection = collection.filter(selectorFunction);
          return filteredCollection;
        };
        selfn.matches = function(ele) {
          var self = this;
          if (self._private.invalid) {
            return false;
          }
          for (var j = 0; j < self.length; j++) {
            var query = self[j];
            if (queryMatches(query, ele)) {
              return true;
            }
          }
          return false;
        };
        selfn.toString = selfn.selector = function() {
          var str = '';
          var clean = function(obj, isValue) {
            if (is.string(obj)) {
              return isValue ? '"' + obj + '"' : obj;
            }
            return '';
          };
          var queryToString = function(query) {
            var str = '';
            if (query.subject === query) {
              str += '$';
            }
            var group = clean(query.group);
            str += group.substring(0, group.length - 1);
            for (var j = 0; j < query.data.length; j++) {
              var data = query.data[j];
              if (data.value) {
                str += '[' + data.field + clean(data.operator) + clean(data.value, true) + ']';
              } else {
                str += '[' + clean(data.operator) + data.field + ']';
              }
            }
            for (var j = 0; j < query.meta.length; j++) {
              var meta = query.meta[j];
              str += '[[' + meta.field + clean(meta.operator) + clean(meta.value, true) + ']]';
            }
            for (var j = 0; j < query.colonSelectors.length; j++) {
              var sel = query.colonSelectors[i];
              str += sel;
            }
            for (var j = 0; j < query.ids.length; j++) {
              var sel = '#' + query.ids[i];
              str += sel;
            }
            for (var j = 0; j < query.classes.length; j++) {
              var sel = '.' + query.classes[j];
              str += sel;
            }
            if (query.parent != null) {
              str = queryToString(query.parent) + ' > ' + str;
            }
            if (query.ancestor != null) {
              str = queryToString(query.ancestor) + ' ' + str;
            }
            if (query.child != null) {
              str += ' > ' + queryToString(query.child);
            }
            if (query.descendant != null) {
              str += ' ' + queryToString(query.descendant);
            }
            return str;
          };
          for (var i = 0; i < this.length; i++) {
            var query = this[i];
            str += queryToString(query);
            if (this.length > 1 && i < this.length - 1) {
              str += ', ';
            }
          }
          return str;
        };
        module.exports = Selector;
      }, {
        "./is": 77,
        "./util": 94
      }],
      82: [function(_dereq_, module, exports) {
        'use strict';
        var util = _dereq_('../util');
        var is = _dereq_('../is');
        var styfn = {};
        styfn.apply = function(eles) {
          var self = this;
          if (self._private.newStyle) {
            this._private.contextStyles = {};
            this._private.propDiffs = {};
          }
          for (var ie = 0; ie < eles.length; ie++) {
            var ele = eles[ie];
            var cxtMeta = self.getContextMeta(ele);
            var cxtStyle = self.getContextStyle(cxtMeta);
            var app = self.applyContextStyle(cxtMeta, cxtStyle, ele);
            self.updateTransitions(ele, app.diffProps);
            self.updateStyleHints(ele);
          }
          self._private.newStyle = false;
        };
        styfn.getPropertiesDiff = function(oldCxtKey, newCxtKey) {
          var self = this;
          var cache = self._private.propDiffs = self._private.propDiffs || {};
          var dualCxtKey = oldCxtKey + '-' + newCxtKey;
          var cachedVal = cache[dualCxtKey];
          if (cachedVal) {
            return cachedVal;
          }
          var diffProps = [];
          var addedProp = {};
          for (var i = 0; i < self.length; i++) {
            var cxt = self[i];
            var oldHasCxt = oldCxtKey[i] === 't';
            var newHasCxt = newCxtKey[i] === 't';
            var cxtHasDiffed = oldHasCxt !== newHasCxt;
            var cxtHasMappedProps = cxt.mappedProperties.length > 0;
            if (cxtHasDiffed || cxtHasMappedProps) {
              var props;
              if (cxtHasDiffed && cxtHasMappedProps) {
                props = cxt.properties;
              } else if (cxtHasDiffed) {
                props = cxt.properties;
              } else if (cxtHasMappedProps) {
                props = cxt.mappedProperties;
              }
              for (var j = 0; j < props.length; j++) {
                var prop = props[j];
                var name = prop.name;
                var laterCxtOverrides = false;
                for (var k = i + 1; k < self.length; k++) {
                  var laterCxt = self[k];
                  var hasLaterCxt = newCxtKey[k] === 't';
                  if (!hasLaterCxt) {
                    continue;
                  }
                  laterCxtOverrides = laterCxt.properties[prop.name] != null;
                  if (laterCxtOverrides) {
                    break;
                  }
                }
                if (!addedProp[name] && !laterCxtOverrides) {
                  addedProp[name] = true;
                  diffProps.push(name);
                }
              }
            }
          }
          cache[dualCxtKey] = diffProps;
          return diffProps;
        };
        styfn.getContextMeta = function(ele) {
          var self = this;
          var cxtKey = '';
          var diffProps;
          var prevKey = ele._private.styleCxtKey || '';
          if (self._private.newStyle) {
            prevKey = '';
          }
          for (var i = 0; i < self.length; i++) {
            var context = self[i];
            var contextSelectorMatches = context.selector && context.selector.matches(ele);
            if (contextSelectorMatches) {
              cxtKey += 't';
            } else {
              cxtKey += 'f';
            }
          }
          diffProps = self.getPropertiesDiff(prevKey, cxtKey);
          ele._private.styleCxtKey = cxtKey;
          return {
            key: cxtKey,
            diffPropNames: diffProps
          };
        };
        styfn.getContextStyle = function(cxtMeta) {
          var cxtKey = cxtMeta.key;
          var self = this;
          var cxtStyles = this._private.contextStyles = this._private.contextStyles || {};
          if (cxtStyles[cxtKey]) {
            return cxtStyles[cxtKey];
          }
          var style = {_private: {key: cxtKey}};
          for (var i = 0; i < self.length; i++) {
            var cxt = self[i];
            var hasCxt = cxtKey[i] === 't';
            if (!hasCxt) {
              continue;
            }
            for (var j = 0; j < cxt.properties.length; j++) {
              var prop = cxt.properties[j];
              var styProp = style[prop.name] = prop;
              styProp.context = cxt;
            }
          }
          cxtStyles[cxtKey] = style;
          return style;
        };
        styfn.applyContextStyle = function(cxtMeta, cxtStyle, ele) {
          var self = this;
          var diffProps = cxtMeta.diffPropNames;
          var retDiffProps = {};
          for (var i = 0; i < diffProps.length; i++) {
            var diffPropName = diffProps[i];
            var cxtProp = cxtStyle[diffPropName];
            var eleProp = ele._private.style[diffPropName];
            if (!cxtProp || eleProp === cxtProp) {
              continue;
            }
            var retDiffProp = retDiffProps[diffPropName] = {prev: eleProp};
            self.applyParsedProperty(ele, cxtProp);
            retDiffProp.next = ele._private.style[diffPropName];
            if (retDiffProp.next && retDiffProp.next.bypass) {
              retDiffProp.next = retDiffProp.next.bypassed;
            }
          }
          return {diffProps: retDiffProps};
        };
        styfn.updateStyleHints = function(ele) {
          var _p = ele._private;
          var self = this;
          var style = _p.style;
          if (ele.removed()) {
            return;
          }
          var hasPie = false;
          if (_p.group === 'nodes' && self._private.hasPie) {
            for (var i = 1; i <= self.pieBackgroundN; i++) {
              var size = _p.style['pie-' + i + '-background-size'].value;
              if (size > 0) {
                hasPie = true;
                break;
              }
            }
          }
          _p.hasPie = hasPie;
          var transform = style['text-transform'].strValue;
          var content = style['label'].strValue;
          var fStyle = style['font-style'].strValue;
          var size = style['font-size'].pfValue + 'px';
          var family = style['font-family'].strValue;
          var weight = style['font-weight'].strValue;
          var valign = style['text-valign'].strValue;
          var halign = style['text-valign'].strValue;
          var oWidth = style['text-outline-width'].pfValue;
          var wrap = style['text-wrap'].strValue;
          var wrapW = style['text-max-width'].pfValue;
          _p.labelKey = fStyle + '$' + size + '$' + family + '$' + weight + '$' + content + '$' + transform + '$' + valign + '$' + halign + '$' + oWidth + '$' + wrap + '$' + wrapW;
          _p.fontKey = fStyle + '$' + weight + '$' + size + '$' + family;
          var width = style['width'].pfValue;
          var height = style['height'].pfValue;
          var borderW = style['border-width'].pfValue;
          _p.boundingBoxKey = width + '$' + height + '$' + borderW;
          if (ele._private.group === 'edges') {
            var cpss = style['control-point-step-size'].pfValue;
            var cpd = style['control-point-distances'] ? style['control-point-distances'].pfValue.join('_') : undefined;
            var cpw = style['control-point-weights'].value.join('_');
            var curve = style['curve-style'].strValue;
            var sd = style['segment-distances'] ? style['segment-distances'].pfValue.join('_') : undefined;
            var sw = style['segment-weights'].value.join('_');
            _p.boundingBoxKey += '$' + cpss + '$' + cpd + '$' + cpw + '$' + sd + '$' + sw + '$' + curve;
          }
          _p.styleKey = Date.now();
        };
        styfn.applyParsedProperty = function(ele, parsedProp) {
          var self = this;
          var prop = parsedProp;
          var style = ele._private.style;
          var fieldVal,
              flatProp;
          var types = self.types;
          var type = self.properties[prop.name].type;
          var propIsBypass = prop.bypass;
          var origProp = style[prop.name];
          var origPropIsBypass = origProp && origProp.bypass;
          var _p = ele._private;
          if ((parsedProp.name === 'height' || parsedProp.name === 'width') && ele.isNode()) {
            if (parsedProp.value === 'auto' && !ele.isParent()) {
              return false;
            } else if (parsedProp.value !== 'auto' && ele.isParent()) {
              prop = parsedProp = this.parse(parsedProp.name, 'auto', propIsBypass);
            }
          }
          if (propIsBypass && prop.deleteBypass) {
            var currentProp = style[prop.name];
            if (!currentProp) {
              return true;
            } else if (currentProp.bypass && currentProp.bypassed) {
              style[prop.name] = currentProp.bypassed;
              return true;
            } else {
              return false;
            }
          }
          var printMappingErr = function() {
            util.error('Do not assign mappings to elements without corresponding data (e.g. ele `' + ele.id() + '` for property `' + prop.name + '` with data field `' + prop.field + '`); try a `[' + prop.field + ']` selector to limit scope to elements with `' + prop.field + '` defined');
          };
          switch (prop.mapped) {
            case types.mapData:
            case types.mapLayoutData:
            case types.mapScratch:
              var isLayout = prop.mapped === types.mapLayoutData;
              var isScratch = prop.mapped === types.mapScratch;
              var fields = prop.field.split(".");
              var fieldVal;
              if (isScratch || isLayout) {
                fieldVal = _p.scratch;
              } else {
                fieldVal = _p.data;
              }
              for (var i = 0; i < fields.length && fieldVal; i++) {
                var field = fields[i];
                fieldVal = fieldVal[field];
              }
              var percent;
              if (!is.number(fieldVal)) {
                percent = 0;
              } else {
                percent = (fieldVal - prop.fieldMin) / (prop.fieldMax - prop.fieldMin);
              }
              if (percent < 0) {
                percent = 0;
              } else if (percent > 1) {
                percent = 1;
              }
              if (type.color) {
                var r1 = prop.valueMin[0];
                var r2 = prop.valueMax[0];
                var g1 = prop.valueMin[1];
                var g2 = prop.valueMax[1];
                var b1 = prop.valueMin[2];
                var b2 = prop.valueMax[2];
                var a1 = prop.valueMin[3] == null ? 1 : prop.valueMin[3];
                var a2 = prop.valueMax[3] == null ? 1 : prop.valueMax[3];
                var clr = [Math.round(r1 + (r2 - r1) * percent), Math.round(g1 + (g2 - g1) * percent), Math.round(b1 + (b2 - b1) * percent), Math.round(a1 + (a2 - a1) * percent)];
                flatProp = {
                  bypass: prop.bypass,
                  name: prop.name,
                  value: clr,
                  strValue: 'rgb(' + clr[0] + ', ' + clr[1] + ', ' + clr[2] + ')'
                };
              } else if (type.number) {
                var calcValue = prop.valueMin + (prop.valueMax - prop.valueMin) * percent;
                flatProp = this.parse(prop.name, calcValue, prop.bypass, true);
              } else {
                return false;
              }
              if (!flatProp) {
                flatProp = this.parse(prop.name, origProp.strValue, prop.bypass, true);
              }
              if (!flatProp) {
                printMappingErr();
              }
              flatProp.mapping = prop;
              prop = flatProp;
              break;
            case types.data:
            case types.layoutData:
            case types.scratch:
              var isLayout = prop.mapped === types.layoutData;
              var isScratch = prop.mapped === types.scratch;
              var fields = prop.field.split(".");
              var fieldVal;
              if (isScratch || isLayout) {
                fieldVal = _p.scratch;
              } else {
                fieldVal = _p.data;
              }
              if (fieldVal) {
                for (var i = 0; i < fields.length; i++) {
                  var field = fields[i];
                  fieldVal = fieldVal[field];
                }
              }
              flatProp = this.parse(prop.name, fieldVal, prop.bypass, true);
              if (!flatProp) {
                var flatPropVal = origProp ? origProp.strValue : '';
                flatProp = this.parse(prop.name, flatPropVal, prop.bypass, true);
              }
              if (!flatProp) {
                printMappingErr();
              }
              flatProp.mapping = prop;
              prop = flatProp;
              break;
            case types.fn:
              var fn = prop.value;
              var fnRetVal = fn(ele);
              flatProp = this.parse(prop.name, fnRetVal, prop.bypass, true);
              flatProp.mapping = prop;
              prop = flatProp;
              break;
            case undefined:
              break;
            default:
              return false;
          }
          if (propIsBypass) {
            if (origPropIsBypass) {
              prop.bypassed = origProp.bypassed;
            } else {
              prop.bypassed = origProp;
            }
            style[prop.name] = prop;
          } else {
            if (origPropIsBypass) {
              origProp.bypassed = prop;
            } else {
              style[prop.name] = prop;
            }
          }
          return true;
        };
        styfn.update = function() {
          var cy = this._private.cy;
          var eles = cy.elements();
          eles.updateStyle();
        };
        styfn.updateMappers = function(eles) {
          var self = this;
          for (var i = 0; i < eles.length; i++) {
            var ele = eles[i];
            var style = ele._private.style;
            for (var j = 0; j < self.properties.length; j++) {
              var prop = self.properties[j];
              var propInStyle = style[prop.name];
              if (propInStyle && propInStyle.mapping) {
                var mapping = propInStyle.mapping;
                this.applyParsedProperty(ele, mapping);
              }
            }
            this.updateStyleHints(ele);
          }
        };
        styfn.updateTransitions = function(ele, diffProps, isBypass) {
          var self = this;
          var _p = ele._private;
          var style = _p.style;
          var props = style['transition-property'].value;
          var duration = style['transition-duration'].pfValue;
          var delay = style['transition-delay'].pfValue;
          var css = {};
          if (props.length > 0 && duration > 0) {
            var anyPrev = false;
            for (var i = 0; i < props.length; i++) {
              var prop = props[i];
              var styProp = style[prop];
              var diffProp = diffProps[prop];
              if (!diffProp) {
                continue;
              }
              var prevProp = diffProp.prev;
              var fromProp = prevProp;
              var toProp = diffProp.next != null ? diffProp.next : styProp;
              var diff = false;
              var initVal;
              var initDt = 0.000001;
              if (!fromProp) {
                continue;
              }
              if (is.number(fromProp.pfValue) && is.number(toProp.pfValue)) {
                diff = toProp.pfValue - fromProp.pfValue;
                initVal = fromProp.pfValue + initDt * diff;
              } else if (is.number(fromProp.value) && is.number(toProp.value)) {
                diff = toProp.value - fromProp.value;
                initVal = fromProp.value + initDt * diff;
              } else if (is.array(fromProp.value) && is.array(toProp.value)) {
                diff = fromProp.value[0] !== toProp.value[0] || fromProp.value[1] !== toProp.value[1] || fromProp.value[2] !== toProp.value[2];
                ;
                initVal = fromProp.strValue;
              }
              if (diff) {
                css[prop] = toProp.strValue;
                this.applyBypass(ele, prop, initVal);
                anyPrev = true;
              }
            }
            if (!anyPrev) {
              return;
            }
            _p.transitioning = true;
            ele.stop();
            if (delay > 0) {
              ele.delay(delay);
            }
            ele.animate({css: css}, {
              duration: duration,
              easing: style['transition-timing-function'].value,
              queue: false,
              complete: function() {
                if (!isBypass) {
                  self.removeBypasses(ele, props);
                }
                _p.transitioning = false;
              }
            });
          } else if (_p.transitioning) {
            ele.stop();
            this.removeBypasses(ele, props);
            _p.transitioning = false;
          }
        };
        module.exports = styfn;
      }, {
        "../is": 77,
        "../util": 94
      }],
      83: [function(_dereq_, module, exports) {
        'use strict';
        var is = _dereq_('../is');
        var util = _dereq_('../util');
        var styfn = {};
        styfn.applyBypass = function(eles, name, value, updateTransitions) {
          var self = this;
          var props = [];
          var isBypass = true;
          if (name === "*" || name === "**") {
            if (value !== undefined) {
              for (var i = 0; i < self.properties.length; i++) {
                var prop = self.properties[i];
                var name = prop.name;
                var parsedProp = this.parse(name, value, true);
                if (parsedProp) {
                  props.push(parsedProp);
                }
              }
            }
          } else if (is.string(name)) {
            var parsedProp = this.parse(name, value, true);
            if (parsedProp) {
              props.push(parsedProp);
            }
          } else if (is.plainObject(name)) {
            var specifiedProps = name;
            updateTransitions = value;
            for (var i = 0; i < self.properties.length; i++) {
              var prop = self.properties[i];
              var name = prop.name;
              var value = specifiedProps[name];
              if (value === undefined) {
                value = specifiedProps[util.dash2camel(name)];
              }
              if (value !== undefined) {
                var parsedProp = this.parse(name, value, true);
                if (parsedProp) {
                  props.push(parsedProp);
                }
              }
            }
          } else {
            return false;
          }
          if (props.length === 0) {
            return false;
          }
          var ret = false;
          for (var i = 0; i < eles.length; i++) {
            var ele = eles[i];
            var style = ele._private.style;
            var diffProps = {};
            var diffProp;
            for (var j = 0; j < props.length; j++) {
              var prop = props[j];
              if (updateTransitions) {
                var prevProp = style[prop.name];
                diffProp = diffProps[prop.name] = {prev: prevProp};
              }
              ret = this.applyParsedProperty(ele, prop) || ret;
              if (updateTransitions) {
                diffProp.next = style[prop.name];
              }
            }
            if (ret) {
              this.updateStyleHints(ele);
            }
            if (updateTransitions) {
              this.updateTransitions(ele, diffProps, isBypass);
            }
          }
          return ret;
        };
        styfn.overrideBypass = function(eles, name, value) {
          name = util.camel2dash(name);
          for (var i = 0; i < eles.length; i++) {
            var ele = eles[i];
            var prop = ele._private.style[name];
            var type = this.properties[name].type;
            var isColor = type.color;
            var isMulti = type.mutiple;
            if (!prop.bypass) {
              this.applyBypass(ele, name, value);
              continue;
            }
            prop.value = value;
            if (prop.pfValue != null) {
              prop.pfValue = value;
            }
            if (isColor) {
              prop.strValue = 'rgb(' + value.join(',') + ')';
            } else if (isMulti) {
              prop.strValue = value.join(' ');
            } else {
              prop.strValue = '' + value;
            }
          }
        };
        styfn.removeAllBypasses = function(eles, updateTransitions) {
          return this.removeBypasses(eles, this.propertyNames, updateTransitions);
        };
        styfn.removeBypasses = function(eles, props, updateTransitions) {
          var isBypass = true;
          for (var j = 0; j < eles.length; j++) {
            var ele = eles[j];
            var diffProps = {};
            var style = ele._private.style;
            for (var i = 0; i < props.length; i++) {
              var name = props[i];
              var prop = this.properties[name];
              var value = '';
              var parsedProp = this.parse(name, value, true);
              var prevProp = style[prop.name];
              var diffProp = diffProps[prop.name] = {prev: prevProp};
              this.applyParsedProperty(ele, parsedProp);
              diffProp.next = style[prop.name];
            }
            this.updateStyleHints(ele);
            if (updateTransitions) {
              this.updateTransitions(ele, diffProps, isBypass);
            }
          }
        };
        module.exports = styfn;
      }, {
        "../is": 77,
        "../util": 94
      }],
      84: [function(_dereq_, module, exports) {
        'use strict';
        var window = _dereq_('../window');
        var styfn = {};
        styfn.getEmSizeInPixels = function() {
          var px = this.containerCss('font-size');
          if (px != null) {
            return parseFloat(px);
          } else {
            return 1;
          }
        };
        styfn.containerCss = function(propName) {
          var cy = this._private.cy;
          var domElement = cy.container();
          if (window && domElement && window.getComputedStyle) {
            return window.getComputedStyle(domElement).getPropertyValue(propName);
          }
        };
        module.exports = styfn;
      }, {"../window": 100}],
      85: [function(_dereq_, module, exports) {
        'use strict';
        var util = _dereq_('../util');
        var is = _dereq_('../is');
        var styfn = {};
        styfn.getRenderedStyle = function(ele) {
          return this.getRawStyle(ele, true);
        };
        styfn.getRawStyle = function(ele, isRenderedVal) {
          var self = this;
          var ele = ele[0];
          if (ele) {
            var rstyle = {};
            for (var i = 0; i < self.properties.length; i++) {
              var prop = self.properties[i];
              var val = self.getStylePropertyValue(ele, prop.name, isRenderedVal);
              if (val) {
                rstyle[prop.name] = val;
                rstyle[util.dash2camel(prop.name)] = val;
              }
            }
            return rstyle;
          }
        };
        styfn.getStylePropertyValue = function(ele, propName, isRenderedVal) {
          var self = this;
          var ele = ele[0];
          if (ele) {
            var style = ele._private.style;
            var prop = self.properties[propName];
            var type = prop.type;
            var styleProp = style[prop.name];
            var zoom = ele.cy().zoom();
            if (styleProp) {
              var units = styleProp.units ? type.implicitUnits || 'px' : null;
              var val = units ? [].concat(styleProp.pfValue).map(function(pfValue) {
                return (pfValue * (isRenderedVal ? zoom : 1)) + units;
              }).join(' ') : styleProp.strValue;
              return val;
            }
          }
        };
        styfn.getValueStyle = function(ele) {
          var self = this;
          var rstyle = {};
          var style;
          var isEle = is.element(ele);
          if (isEle) {
            style = ele._private.style;
          } else {
            style = ele;
          }
          if (style) {
            for (var i = 0; i < self.properties.length; i++) {
              var prop = self.properties[i];
              var styleProp = style[prop.name] || style[util.dash2camel(prop.name)];
              if (styleProp !== undefined) {
                if (is.plainObject(styleProp)) {
                  styleProp = this.parse(prop.name, styleProp.strValue);
                } else {
                  styleProp = this.parse(prop.name, styleProp);
                }
              }
              if (styleProp) {
                rstyle[prop.name] = styleProp;
                rstyle[util.dash2camel(prop.name)] = styleProp;
              }
            }
          }
          return rstyle;
        };
        styfn.getPropsList = function(propsObj) {
          var self = this;
          var rstyle = [];
          var style = propsObj;
          var props = self.properties;
          if (style) {
            for (var name in style) {
              var val = style[name];
              var prop = props[name] || props[util.camel2dash(name)];
              var styleProp = this.parse(prop.name, val);
              rstyle.push(styleProp);
            }
          }
          return rstyle;
        };
        module.exports = styfn;
      }, {
        "../is": 77,
        "../util": 94
      }],
      86: [function(_dereq_, module, exports) {
        'use strict';
        var is = _dereq_('../is');
        var util = _dereq_('../util');
        var Selector = _dereq_('../selector');
        var Style = function(cy) {
          if (!(this instanceof Style)) {
            return new Style(cy);
          }
          if (!is.core(cy)) {
            util.error('A style must have a core reference');
            return;
          }
          this._private = {
            cy: cy,
            coreStyle: {},
            newStyle: true
          };
          this.length = 0;
          this.addDefaultStylesheet();
        };
        var styfn = Style.prototype;
        styfn.instanceString = function() {
          return 'style';
        };
        styfn.clear = function() {
          for (var i = 0; i < this.length; i++) {
            this[i] = undefined;
          }
          this.length = 0;
          this._private.newStyle = true;
          return this;
        };
        styfn.resetToDefault = function() {
          this.clear();
          this.addDefaultStylesheet();
          return this;
        };
        styfn.core = function() {
          return this._private.coreStyle;
        };
        styfn.selector = function(selectorStr) {
          var selector = selectorStr === 'core' ? null : new Selector(selectorStr);
          var i = this.length++;
          this[i] = {
            selector: selector,
            properties: [],
            mappedProperties: [],
            index: i
          };
          return this;
        };
        styfn.css = function() {
          var self = this;
          var args = arguments;
          switch (args.length) {
            case 1:
              var map = args[0];
              for (var i = 0; i < self.properties.length; i++) {
                var prop = self.properties[i];
                var mapVal = map[prop.name];
                if (mapVal === undefined) {
                  mapVal = map[util.dash2camel(prop.name)];
                }
                if (mapVal !== undefined) {
                  this.cssRule(prop.name, mapVal);
                }
              }
              break;
            case 2:
              this.cssRule(args[0], args[1]);
              break;
            default:
              break;
          }
          return this;
        };
        styfn.style = styfn.css;
        styfn.cssRule = function(name, value) {
          var property = this.parse(name, value);
          if (property) {
            var i = this.length - 1;
            this[i].properties.push(property);
            this[i].properties[property.name] = property;
            if (property.name.match(/pie-(\d+)-background-size/) && property.value) {
              this._private.hasPie = true;
            }
            if (property.mapped) {
              this[i].mappedProperties.push(property);
            }
            var currentSelectorIsCore = !this[i].selector;
            if (currentSelectorIsCore) {
              this._private.coreStyle[property.name] = property;
            }
          }
          return this;
        };
        Style.fromJson = function(cy, json) {
          var style = new Style(cy);
          style.fromJson(json);
          return style;
        };
        Style.fromString = function(cy, string) {
          return new Style(cy).fromString(string);
        };
        [_dereq_('./apply'), _dereq_('./bypass'), _dereq_('./container'), _dereq_('./get-for-ele'), _dereq_('./json'), _dereq_('./string-sheet'), _dereq_('./properties'), _dereq_('./parse')].forEach(function(props) {
          util.extend(styfn, props);
        });
        Style.types = styfn.types;
        Style.properties = styfn.properties;
        module.exports = Style;
      }, {
        "../is": 77,
        "../selector": 81,
        "../util": 94,
        "./apply": 82,
        "./bypass": 83,
        "./container": 84,
        "./get-for-ele": 85,
        "./json": 87,
        "./parse": 88,
        "./properties": 89,
        "./string-sheet": 90
      }],
      87: [function(_dereq_, module, exports) {
        'use strict';
        var styfn = {};
        styfn.applyFromJson = function(json) {
          var style = this;
          for (var i = 0; i < json.length; i++) {
            var context = json[i];
            var selector = context.selector;
            var props = context.style || context.css;
            style.selector(selector);
            for (var name in props) {
              var value = props[name];
              style.css(name, value);
            }
          }
          return style;
        };
        styfn.fromJson = function(json) {
          var style = this;
          style.resetToDefault();
          style.applyFromJson(json);
          return style;
        };
        styfn.json = function() {
          var json = [];
          for (var i = this.defaultLength; i < this.length; i++) {
            var cxt = this[i];
            var selector = cxt.selector;
            var props = cxt.properties;
            var css = {};
            for (var j = 0; j < props.length; j++) {
              var prop = props[j];
              css[prop.name] = prop.strValue;
            }
            json.push({
              selector: !selector ? 'core' : selector.toString(),
              style: css
            });
          }
          return json;
        };
        module.exports = styfn;
      }, {}],
      88: [function(_dereq_, module, exports) {
        'use strict';
        var util = _dereq_('../util');
        var is = _dereq_('../is');
        var styfn = {};
        styfn.parse = function(name, value, propIsBypass, propIsFlat) {
          var argHash = [name, value, propIsBypass, propIsFlat].join('$');
          var propCache = this.propCache = this.propCache || {};
          var ret;
          var impl = parseImpl.bind(this);
          if (!(ret = propCache[argHash])) {
            ret = propCache[argHash] = impl(name, value, propIsBypass, propIsFlat);
          }
          ret = util.copy(ret);
          if (ret) {
            ret.value = util.copy(ret.value);
          }
          return ret;
        };
        var parseImpl = function(name, value, propIsBypass, propIsFlat) {
          var self = this;
          name = util.camel2dash(name);
          var property = self.properties[name];
          var passedValue = value;
          var types = self.types;
          if (!property) {
            return null;
          }
          if (value === undefined || value === null) {
            return null;
          }
          if (property.alias) {
            property = property.pointsTo;
            name = property.name;
          }
          var valueIsString = is.string(value);
          if (valueIsString) {
            value = value.trim();
          }
          var type = property.type;
          if (!type) {
            return null;
          }
          if (propIsBypass && (value === '' || value === null)) {
            return {
              name: name,
              value: value,
              bypass: true,
              deleteBypass: true
            };
          }
          if (is.fn(value)) {
            return {
              name: name,
              value: value,
              strValue: 'fn',
              mapped: types.fn,
              bypass: propIsBypass
            };
          }
          var data,
              mapData,
              layoutData,
              mapLayoutData,
              scratch,
              mapScratch;
          if (!valueIsString || propIsFlat) {} else if ((data = new RegExp(types.data.regex).exec(value)) || (layoutData = new RegExp(types.layoutData.regex).exec(value)) || (scratch = new RegExp(types.scratch.regex).exec(value))) {
            if (propIsBypass) {
              return false;
            }
            var mapped;
            if (data) {
              mapped = types.data;
            } else if (layoutData) {
              mapped = types.layoutData;
            } else {
              mapped = types.scratch;
            }
            data = data || layoutData || scratch;
            return {
              name: name,
              value: data,
              strValue: '' + value,
              mapped: mapped,
              field: data[1],
              bypass: propIsBypass
            };
          } else if ((mapData = new RegExp(types.mapData.regex).exec(value)) || (mapLayoutData = new RegExp(types.mapLayoutData.regex).exec(value)) || (mapScratch = new RegExp(types.mapScratch.regex).exec(value))) {
            if (propIsBypass) {
              return false;
            }
            if (type.multiple) {
              return false;
            }
            var mapped;
            if (mapData) {
              mapped = types.mapData;
            } else if (mapLayoutData) {
              mapped = types.mapLayoutData;
            } else {
              mapped = types.mapScratch;
            }
            mapData = mapData || mapLayoutData || mapScratch;
            if (!(type.color || type.number)) {
              return false;
            }
            var valueMin = this.parse(name, mapData[4]);
            if (!valueMin || valueMin.mapped) {
              return false;
            }
            var valueMax = this.parse(name, mapData[5]);
            if (!valueMax || valueMax.mapped) {
              return false;
            }
            if (valueMin.value === valueMax.value) {
              return false;
            } else if (type.color) {
              var c1 = valueMin.value;
              var c2 = valueMax.value;
              var same = c1[0] === c2[0] && c1[1] === c2[1] && c1[2] === c2[2] && (c1[3] === c2[3] || ((c1[3] == null || c1[3] === 1) && (c2[3] == null || c2[3] === 1)));
              ;
              if (same) {
                return false;
              }
            }
            return {
              name: name,
              value: mapData,
              strValue: '' + value,
              mapped: mapped,
              field: mapData[1],
              fieldMin: parseFloat(mapData[2]),
              fieldMax: parseFloat(mapData[3]),
              valueMin: valueMin.value,
              valueMax: valueMax.value,
              bypass: propIsBypass
            };
          }
          if (type.multiple && propIsFlat !== 'multiple') {
            var vals;
            if (valueIsString) {
              vals = value.split(/\s+/);
            } else if (is.array(value)) {
              vals = value;
            } else {
              vals = [value];
            }
            if (type.evenMultiple && vals.length % 2 !== 0) {
              return null;
            }
            var valArr = vals.map(function(v) {
              var p = self.parse(name, v, propIsBypass, 'multiple');
              if (p.pfValue != null) {
                return p.pfValue;
              } else {
                return p.value;
              }
            });
            return {
              name: name,
              value: valArr,
              pfValue: valArr,
              strValue: valArr.join(' '),
              bypass: propIsBypass,
              units: type.number && !type.unitless ? type.implicitUnits || 'px' : undefined
            };
          }
          var checkEnums = function() {
            for (var i = 0; i < type.enums.length; i++) {
              var en = type.enums[i];
              if (en === value) {
                return {
                  name: name,
                  value: value,
                  strValue: '' + value,
                  bypass: propIsBypass
                };
              }
            }
            return null;
          };
          if (type.number) {
            var units;
            var implicitUnits = 'px';
            if (type.units) {
              units = type.units;
            }
            if (type.implicitUnits) {
              implicitUnits = type.implicitUnits;
            }
            if (!type.unitless) {
              if (valueIsString) {
                var unitsRegex = 'px|em' + (type.allowPercent ? '|\\%' : '');
                if (units) {
                  unitsRegex = units;
                }
                var match = value.match('^(' + util.regex.number + ')(' + unitsRegex + ')?' + '$');
                if (match) {
                  value = match[1];
                  units = match[2] || implicitUnits;
                }
              } else if (!units || type.implicitUnits) {
                units = implicitUnits;
              }
            }
            value = parseFloat(value);
            if (isNaN(value) && type.enums === undefined) {
              return null;
            }
            if (isNaN(value) && type.enums !== undefined) {
              value = passedValue;
              return checkEnums();
            }
            if (type.integer && !is.integer(value)) {
              return null;
            }
            if ((type.min !== undefined && value < type.min) || (type.max !== undefined && value > type.max)) {
              return null;
            }
            var ret = {
              name: name,
              value: value,
              strValue: '' + value + (units ? units : ''),
              units: units,
              bypass: propIsBypass
            };
            if (type.unitless || (units !== 'px' && units !== 'em')) {
              ret.pfValue = value;
            } else {
              ret.pfValue = (units === 'px' || !units ? (value) : (this.getEmSizeInPixels() * value));
            }
            if (units === 'ms' || units === 's') {
              ret.pfValue = units === 'ms' ? value : 1000 * value;
            }
            if (units === 'deg' || units === 'rad') {
              ret.pfValue = units === 'rad' ? value : value * Math.PI / 180;
            }
            return ret;
          } else if (type.propList) {
            var props = [];
            var propsStr = '' + value;
            if (propsStr === 'none') {} else {
              var propsSplit = propsStr.split(',');
              for (var i = 0; i < propsSplit.length; i++) {
                var propName = propsSplit[i].trim();
                if (self.properties[propName]) {
                  props.push(propName);
                }
              }
              if (props.length === 0) {
                return null;
              }
            }
            return {
              name: name,
              value: props,
              strValue: props.length === 0 ? 'none' : props.join(', '),
              bypass: propIsBypass
            };
          } else if (type.color) {
            var tuple = util.color2tuple(value);
            if (!tuple) {
              return null;
            }
            return {
              name: name,
              value: tuple,
              strValue: '' + value,
              bypass: propIsBypass,
              roundValue: true
            };
          } else if (type.regex || type.regexes) {
            if (type.enums) {
              var enumProp = checkEnums();
              if (enumProp) {
                return enumProp;
              }
            }
            var regexes = type.regexes ? type.regexes : [type.regex];
            for (var i = 0; i < regexes.length; i++) {
              var regex = new RegExp(regexes[i]);
              var m = regex.exec(value);
              if (m) {
                return {
                  name: name,
                  value: m,
                  strValue: '' + value,
                  bypass: propIsBypass
                };
              }
            }
            return null;
          } else if (type.string) {
            return {
              name: name,
              value: value,
              strValue: '' + value,
              bypass: propIsBypass
            };
          } else if (type.enums) {
            return checkEnums();
          } else {
            return null;
          }
        };
        module.exports = styfn;
      }, {
        "../is": 77,
        "../util": 94
      }],
      89: [function(_dereq_, module, exports) {
        'use strict';
        var util = _dereq_('../util');
        var styfn = {};
        (function() {
          var number = util.regex.number;
          var rgba = util.regex.rgbaNoBackRefs;
          var hsla = util.regex.hslaNoBackRefs;
          var hex3 = util.regex.hex3;
          var hex6 = util.regex.hex6;
          var data = function(prefix) {
            return '^' + prefix + '\\s*\\(\\s*([\\w\\.]+)\\s*\\)$';
          };
          var mapData = function(prefix) {
            var mapArg = number + '|\\w+|' + rgba + '|' + hsla + '|' + hex3 + '|' + hex6;
            return '^' + prefix + '\\s*\\(([\\w\\.]+)\\s*\\,\\s*(' + number + ')\\s*\\,\\s*(' + number + ')\\s*,\\s*(' + mapArg + ')\\s*\\,\\s*(' + mapArg + ')\\)$';
          };
          styfn.types = {
            time: {
              number: true,
              min: 0,
              units: 's|ms',
              implicitUnits: 'ms'
            },
            percent: {
              number: true,
              min: 0,
              max: 100,
              units: '%',
              implicitUnits: '%'
            },
            zeroOneNumber: {
              number: true,
              min: 0,
              max: 1,
              unitless: true
            },
            nOneOneNumber: {
              number: true,
              min: -1,
              max: 1,
              unitless: true
            },
            nonNegativeInt: {
              number: true,
              min: 0,
              integer: true,
              unitless: true
            },
            position: {enums: ['parent', 'origin']},
            nodeSize: {
              number: true,
              min: 0,
              enums: ['auto', 'label']
            },
            number: {
              number: true,
              unitless: true
            },
            numbers: {
              number: true,
              unitless: true,
              multiple: true
            },
            size: {
              number: true,
              min: 0
            },
            bidirectionalSize: {number: true},
            bidirectionalSizes: {
              number: true,
              multiple: true
            },
            bgSize: {
              number: true,
              min: 0,
              allowPercent: true
            },
            bgWH: {
              number: true,
              min: 0,
              allowPercent: true,
              enums: ['auto']
            },
            bgPos: {
              number: true,
              allowPercent: true
            },
            bgRepeat: {enums: ['repeat', 'repeat-x', 'repeat-y', 'no-repeat']},
            bgFit: {enums: ['none', 'contain', 'cover']},
            bgClip: {enums: ['none', 'node']},
            color: {color: true},
            bool: {enums: ['yes', 'no']},
            lineStyle: {enums: ['solid', 'dotted', 'dashed']},
            borderStyle: {enums: ['solid', 'dotted', 'dashed', 'double']},
            curveStyle: {enums: ['bezier', 'unbundled-bezier', 'haystack', 'segments']},
            fontFamily: {regex: '^([\\w- \\"]+(?:\\s*,\\s*[\\w- \\"]+)*)$'},
            fontVariant: {enums: ['small-caps', 'normal']},
            fontStyle: {enums: ['italic', 'normal', 'oblique']},
            fontWeight: {enums: ['normal', 'bold', 'bolder', 'lighter', '100', '200', '300', '400', '500', '600', '800', '900', 100, 200, 300, 400, 500, 600, 700, 800, 900]},
            textDecoration: {enums: ['none', 'underline', 'overline', 'line-through']},
            textTransform: {enums: ['none', 'uppercase', 'lowercase']},
            textWrap: {enums: ['none', 'wrap']},
            textBackgroundShape: {enums: ['rectangle', 'roundrectangle']},
            nodeShape: {enums: ['rectangle', 'roundrectangle', 'ellipse', 'triangle', 'square', 'pentagon', 'hexagon', 'heptagon', 'octagon', 'star', 'diamond', 'vee', 'rhomboid', 'polygon']},
            compoundIncludeLabels: {enums: ['include', 'exclude']},
            arrowShape: {enums: ['tee', 'triangle', 'triangle-tee', 'triangle-backcurve', 'half-triangle-overshot', 'vee', 'square', 'circle', 'diamond', 'none']},
            arrowFill: {enums: ['filled', 'hollow']},
            display: {enums: ['element', 'none']},
            visibility: {enums: ['hidden', 'visible']},
            valign: {enums: ['top', 'center', 'bottom']},
            halign: {enums: ['left', 'center', 'right']},
            text: {string: true},
            data: {
              mapping: true,
              regex: data('data')
            },
            layoutData: {
              mapping: true,
              regex: data('layoutData')
            },
            scratch: {
              mapping: true,
              regex: data('scratch')
            },
            mapData: {
              mapping: true,
              regex: mapData('mapData')
            },
            mapLayoutData: {
              mapping: true,
              regex: mapData('mapLayoutData')
            },
            mapScratch: {
              mapping: true,
              regex: mapData('mapScratch')
            },
            fn: {
              mapping: true,
              fn: true
            },
            url: {regex: '^url\\s*\\(\\s*([^\\s]+)\\s*\\s*\\)|none|(.+)$'},
            propList: {propList: true},
            angle: {
              number: true,
              units: 'deg|rad',
              implicitUnits: 'rad'
            },
            textRotation: {enums: ['none', 'autorotate']},
            polygonPointList: {
              number: true,
              multiple: true,
              evenMultiple: true,
              min: -1,
              max: 1,
              unitless: true
            },
            easing: {
              regexes: ['^(spring)\\s*\\(\\s*(' + number + ')\\s*,\\s*(' + number + ')\\s*\\)$', '^(cubic-bezier)\\s*\\(\\s*(' + number + ')\\s*,\\s*(' + number + ')\\s*,\\s*(' + number + ')\\s*,\\s*(' + number + ')\\s*\\)$'],
              enums: ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'ease-in-sine', 'ease-out-sine', 'ease-in-out-sine', 'ease-in-quad', 'ease-out-quad', 'ease-in-out-quad', 'ease-in-cubic', 'ease-out-cubic', 'ease-in-out-cubic', 'ease-in-quart', 'ease-out-quart', 'ease-in-out-quart', 'ease-in-quint', 'ease-out-quint', 'ease-in-out-quint', 'ease-in-expo', 'ease-out-expo', 'ease-in-out-expo', 'ease-in-circ', 'ease-out-circ', 'ease-in-out-circ']
            }
          };
          var t = styfn.types;
          var props = styfn.properties = [{
            name: 'text-valign',
            type: t.valign
          }, {
            name: 'text-halign',
            type: t.halign
          }, {
            name: 'color',
            type: t.color
          }, {
            name: 'label',
            type: t.text
          }, {
            name: 'text-outline-color',
            type: t.color
          }, {
            name: 'text-outline-width',
            type: t.size
          }, {
            name: 'text-outline-opacity',
            type: t.zeroOneNumber
          }, {
            name: 'text-opacity',
            type: t.zeroOneNumber
          }, {
            name: 'text-background-color',
            type: t.color
          }, {
            name: 'text-background-opacity',
            type: t.zeroOneNumber
          }, {
            name: 'text-border-opacity',
            type: t.zeroOneNumber
          }, {
            name: 'text-border-color',
            type: t.color
          }, {
            name: 'text-border-width',
            type: t.size
          }, {
            name: 'text-border-style',
            type: t.borderStyle
          }, {
            name: 'text-background-shape',
            type: t.textBackgroundShape
          }, {
            name: 'text-transform',
            type: t.textTransform
          }, {
            name: 'text-wrap',
            type: t.textWrap
          }, {
            name: 'text-max-width',
            type: t.size
          }, {
            name: 'text-events',
            type: t.bool
          }, {
            name: 'font-family',
            type: t.fontFamily
          }, {
            name: 'font-style',
            type: t.fontStyle
          }, {
            name: 'font-weight',
            type: t.fontWeight
          }, {
            name: 'font-size',
            type: t.size
          }, {
            name: 'min-zoomed-font-size',
            type: t.size
          }, {
            name: 'edge-text-rotation',
            type: t.textRotation
          }, {
            name: 'events',
            type: t.bool
          }, {
            name: 'display',
            type: t.display
          }, {
            name: 'visibility',
            type: t.visibility
          }, {
            name: 'opacity',
            type: t.zeroOneNumber
          }, {
            name: 'z-index',
            type: t.nonNegativeInt
          }, {
            name: 'overlay-padding',
            type: t.size
          }, {
            name: 'overlay-color',
            type: t.color
          }, {
            name: 'overlay-opacity',
            type: t.zeroOneNumber
          }, {
            name: 'shadow-blur',
            type: t.size
          }, {
            name: 'shadow-color',
            type: t.color
          }, {
            name: 'shadow-opacity',
            type: t.zeroOneNumber
          }, {
            name: 'shadow-offset-x',
            type: t.bidirectionalSize
          }, {
            name: 'shadow-offset-y',
            type: t.bidirectionalSize
          }, {
            name: 'text-shadow-blur',
            type: t.size
          }, {
            name: 'text-shadow-color',
            type: t.color
          }, {
            name: 'text-shadow-opacity',
            type: t.zeroOneNumber
          }, {
            name: 'text-shadow-offset-x',
            type: t.bidirectionalSize
          }, {
            name: 'text-shadow-offset-y',
            type: t.bidirectionalSize
          }, {
            name: 'transition-property',
            type: t.propList
          }, {
            name: 'transition-duration',
            type: t.time
          }, {
            name: 'transition-delay',
            type: t.time
          }, {
            name: 'transition-timing-function',
            type: t.easing
          }, {
            name: 'height',
            type: t.nodeSize
          }, {
            name: 'width',
            type: t.nodeSize
          }, {
            name: 'shape',
            type: t.nodeShape
          }, {
            name: 'shape-polygon-points',
            type: t.polygonPointList
          }, {
            name: 'background-color',
            type: t.color
          }, {
            name: 'background-opacity',
            type: t.zeroOneNumber
          }, {
            name: 'background-blacken',
            type: t.nOneOneNumber
          }, {
            name: 'padding-left',
            type: t.size
          }, {
            name: 'padding-right',
            type: t.size
          }, {
            name: 'padding-top',
            type: t.size
          }, {
            name: 'padding-bottom',
            type: t.size
          }, {
            name: 'border-color',
            type: t.color
          }, {
            name: 'border-opacity',
            type: t.zeroOneNumber
          }, {
            name: 'border-width',
            type: t.size
          }, {
            name: 'border-style',
            type: t.borderStyle
          }, {
            name: 'background-image',
            type: t.url
          }, {
            name: 'background-image-opacity',
            type: t.zeroOneNumber
          }, {
            name: 'background-position-x',
            type: t.bgPos
          }, {
            name: 'background-position-y',
            type: t.bgPos
          }, {
            name: 'background-repeat',
            type: t.bgRepeat
          }, {
            name: 'background-fit',
            type: t.bgFit
          }, {
            name: 'background-clip',
            type: t.bgClip
          }, {
            name: 'background-width',
            type: t.bgWH
          }, {
            name: 'background-height',
            type: t.bgWH
          }, {
            name: 'position',
            type: t.position
          }, {
            name: 'compound-sizing-wrt-labels',
            type: t.compoundIncludeLabels
          }, {
            name: 'line-style',
            type: t.lineStyle
          }, {
            name: 'line-color',
            type: t.color
          }, {
            name: 'curve-style',
            type: t.curveStyle
          }, {
            name: 'haystack-radius',
            type: t.zeroOneNumber
          }, {
            name: 'control-point-step-size',
            type: t.size
          }, {
            name: 'control-point-distances',
            type: t.bidirectionalSizes
          }, {
            name: 'control-point-weights',
            type: t.numbers
          }, {
            name: 'segment-distances',
            type: t.bidirectionalSizes
          }, {
            name: 'segment-weights',
            type: t.numbers
          }, {
            name: 'selection-box-color',
            type: t.color
          }, {
            name: 'selection-box-opacity',
            type: t.zeroOneNumber
          }, {
            name: 'selection-box-border-color',
            type: t.color
          }, {
            name: 'selection-box-border-width',
            type: t.size
          }, {
            name: 'active-bg-color',
            type: t.color
          }, {
            name: 'active-bg-opacity',
            type: t.zeroOneNumber
          }, {
            name: 'active-bg-size',
            type: t.size
          }, {
            name: 'outside-texture-bg-color',
            type: t.color
          }, {
            name: 'outside-texture-bg-opacity',
            type: t.zeroOneNumber
          }];
          var aliases = styfn.aliases = [{
            name: 'content',
            pointsTo: 'label'
          }, {
            name: 'control-point-distance',
            pointsTo: 'control-point-distances'
          }, {
            name: 'control-point-weight',
            pointsTo: 'control-point-weights'
          }];
          styfn.pieBackgroundN = 16;
          props.push({
            name: 'pie-size',
            type: t.bgSize
          });
          for (var i = 1; i <= styfn.pieBackgroundN; i++) {
            props.push({
              name: 'pie-' + i + '-background-color',
              type: t.color
            });
            props.push({
              name: 'pie-' + i + '-background-size',
              type: t.percent
            });
            props.push({
              name: 'pie-' + i + '-background-opacity',
              type: t.zeroOneNumber
            });
          }
          var arrowPrefixes = styfn.arrowPrefixes = ['source', 'mid-source', 'target', 'mid-target'];
          [{
            name: 'arrow-shape',
            type: t.arrowShape
          }, {
            name: 'arrow-color',
            type: t.color
          }, {
            name: 'arrow-fill',
            type: t.arrowFill
          }].forEach(function(prop) {
            arrowPrefixes.forEach(function(prefix) {
              var name = prefix + '-' + prop.name;
              var type = prop.type;
              props.push({
                name: name,
                type: type
              });
            });
          }, {});
          styfn.propertyNames = props.map(function(p) {
            return p.name;
          });
          for (var i = 0; i < props.length; i++) {
            var prop = props[i];
            props[prop.name] = prop;
          }
          for (var i = 0; i < aliases.length; i++) {
            var alias = aliases[i];
            var pointsToProp = props[alias.pointsTo];
            var aliasProp = {
              name: alias.name,
              alias: true,
              pointsTo: pointsToProp
            };
            props.push(aliasProp);
            props[alias.name] = aliasProp;
          }
        })();
        styfn.addDefaultStylesheet = function() {
          this.selector('node, edge').css(util.extend({
            'events': 'yes',
            'text-events': 'no',
            'text-valign': 'top',
            'text-halign': 'center',
            'color': '#000',
            'text-outline-color': '#000',
            'text-outline-width': 0,
            'text-outline-opacity': 1,
            'text-opacity': 1,
            'text-decoration': 'none',
            'text-transform': 'none',
            'text-wrap': 'none',
            'text-max-width': 9999,
            'text-background-color': '#000',
            'text-background-opacity': 0,
            'text-border-opacity': 0,
            'text-border-width': 0,
            'text-border-style': 'solid',
            'text-border-color': '#000',
            'text-background-shape': 'rectangle',
            'font-family': 'Helvetica Neue, Helvetica, sans-serif',
            'font-style': 'normal',
            'font-weight': 'normal',
            'font-size': 16,
            'min-zoomed-font-size': 0,
            'edge-text-rotation': 'none',
            'visibility': 'visible',
            'display': 'element',
            'opacity': 1,
            'z-index': 0,
            'label': '',
            'overlay-opacity': 0,
            'overlay-color': '#000',
            'overlay-padding': 10,
            'shadow-opacity': 0,
            'shadow-color': '#000',
            'shadow-blur': 10,
            'shadow-offset-x': 0,
            'shadow-offset-y': 0,
            'text-shadow-opacity': 0,
            'text-shadow-color': '#000',
            'text-shadow-blur': 5,
            'text-shadow-offset-x': 0,
            'text-shadow-offset-y': 0,
            'transition-property': 'none',
            'transition-duration': 0,
            'transition-delay': 0,
            'transition-timing-function': 'linear',
            'background-blacken': 0,
            'background-color': '#888',
            'background-opacity': 1,
            'background-image': 'none',
            'background-image-opacity': 1,
            'background-position-x': '50%',
            'background-position-y': '50%',
            'background-repeat': 'no-repeat',
            'background-fit': 'none',
            'background-clip': 'node',
            'background-width': 'auto',
            'background-height': 'auto',
            'border-color': '#000',
            'border-opacity': 1,
            'border-width': 0,
            'border-style': 'solid',
            'height': 30,
            'width': 30,
            'shape': 'ellipse',
            'shape-polygon-points': '-1, -1,   1, -1,   1, 1,   -1, 1',
            'padding-top': 0,
            'padding-bottom': 0,
            'padding-left': 0,
            'padding-right': 0,
            'position': 'origin',
            'compound-sizing-wrt-labels': 'include'
          }, {'pie-size': '100%'}, [{
            name: 'pie-{{i}}-background-color',
            value: 'black'
          }, {
            name: 'pie-{{i}}-background-size',
            value: '0%'
          }, {
            name: 'pie-{{i}}-background-opacity',
            value: 1
          }].reduce(function(css, prop) {
            for (var i = 1; i <= styfn.pieBackgroundN; i++) {
              var name = prop.name.replace('{{i}}', i);
              var val = prop.value;
              css[name] = val;
            }
            return css;
          }, {}), {
            'line-style': 'solid',
            'line-color': '#ddd',
            'control-point-step-size': 40,
            'control-point-weights': 0.5,
            'segment-weights': 0.5,
            'segment-distances': 20,
            'curve-style': 'bezier',
            'haystack-radius': 0.8
          }, [{
            name: 'arrow-shape',
            value: 'none'
          }, {
            name: 'arrow-color',
            value: '#ddd'
          }, {
            name: 'arrow-fill',
            value: 'filled'
          }].reduce(function(css, prop) {
            styfn.arrowPrefixes.forEach(function(prefix) {
              var name = prefix + '-' + prop.name;
              var val = prop.value;
              css[name] = val;
            });
            return css;
          }, {}))).selector('$node > node').css({
            'width': 'auto',
            'height': 'auto',
            'shape': 'rectangle',
            'padding-top': 10,
            'padding-right': 10,
            'padding-left': 10,
            'padding-bottom': 10
          }).selector('edge').css({'width': 1}).selector(':active').css({
            'overlay-color': 'black',
            'overlay-padding': 10,
            'overlay-opacity': 0.25
          }).selector('core').css({
            'selection-box-color': '#ddd',
            'selection-box-opacity': 0.65,
            'selection-box-border-color': '#aaa',
            'selection-box-border-width': 1,
            'active-bg-color': 'black',
            'active-bg-opacity': 0.15,
            'active-bg-size': 30,
            'outside-texture-bg-color': '#000',
            'outside-texture-bg-opacity': 0.125
          });
          ;
          this.defaultLength = this.length;
        };
        module.exports = styfn;
      }, {"../util": 94}],
      90: [function(_dereq_, module, exports) {
        'use strict';
        var util = _dereq_('../util');
        var Selector = _dereq_('../selector');
        var styfn = {};
        styfn.applyFromString = function(string) {
          var self = this;
          var style = this;
          var remaining = '' + string;
          var selAndBlockStr;
          var blockRem;
          var propAndValStr;
          remaining = remaining.replace(/[/][*](\s|.)+?[*][/]/g, '');
          function removeSelAndBlockFromRemaining() {
            if (remaining.length > selAndBlockStr.length) {
              remaining = remaining.substr(selAndBlockStr.length);
            } else {
              remaining = '';
            }
          }
          function removePropAndValFromRem() {
            if (blockRem.length > propAndValStr.length) {
              blockRem = blockRem.substr(propAndValStr.length);
            } else {
              blockRem = '';
            }
          }
          while (true) {
            var nothingLeftToParse = remaining.match(/^\s*$/);
            if (nothingLeftToParse) {
              break;
            }
            var selAndBlock = remaining.match(/^\s*((?:.|\s)+?)\s*\{((?:.|\s)+?)\}/);
            if (!selAndBlock) {
              util.error('Halting stylesheet parsing: String stylesheet contains more to parse but no selector and block found in: ' + remaining);
              break;
            }
            selAndBlockStr = selAndBlock[0];
            var selectorStr = selAndBlock[1];
            if (selectorStr !== 'core') {
              var selector = new Selector(selectorStr);
              if (selector._private.invalid) {
                util.error('Skipping parsing of block: Invalid selector found in string stylesheet: ' + selectorStr);
                removeSelAndBlockFromRemaining();
                continue;
              }
            }
            var blockStr = selAndBlock[2];
            var invalidBlock = false;
            blockRem = blockStr;
            var props = [];
            while (true) {
              var nothingLeftToParse = blockRem.match(/^\s*$/);
              if (nothingLeftToParse) {
                break;
              }
              var propAndVal = blockRem.match(/^\s*(.+?)\s*:\s*(.+?)\s*;/);
              if (!propAndVal) {
                util.error('Skipping parsing of block: Invalid formatting of style property and value definitions found in:' + blockStr);
                invalidBlock = true;
                break;
              }
              propAndValStr = propAndVal[0];
              var propStr = propAndVal[1];
              var valStr = propAndVal[2];
              var prop = self.properties[propStr];
              if (!prop) {
                util.error('Skipping property: Invalid property name in: ' + propAndValStr);
                removePropAndValFromRem();
                continue;
              }
              var parsedProp = style.parse(propStr, valStr);
              if (!parsedProp) {
                util.error('Skipping property: Invalid property definition in: ' + propAndValStr);
                removePropAndValFromRem();
                continue;
              }
              props.push({
                name: propStr,
                val: valStr
              });
              removePropAndValFromRem();
            }
            if (invalidBlock) {
              removeSelAndBlockFromRemaining();
              break;
            }
            style.selector(selectorStr);
            for (var i = 0; i < props.length; i++) {
              var prop = props[i];
              style.css(prop.name, prop.val);
            }
            removeSelAndBlockFromRemaining();
          }
          return style;
        };
        styfn.fromString = function(string) {
          var style = this;
          style.resetToDefault();
          style.applyFromString(string);
          return style;
        };
        module.exports = styfn;
      }, {
        "../selector": 81,
        "../util": 94
      }],
      91: [function(_dereq_, module, exports) {
        'use strict';
        var is = _dereq_('./is');
        var util = _dereq_('./util');
        var Style = _dereq_('./style');
        var Stylesheet = function() {
          if (!(this instanceof Stylesheet)) {
            return new Stylesheet();
          }
          this.length = 0;
        };
        var sheetfn = Stylesheet.prototype;
        sheetfn.instanceString = function() {
          return 'stylesheet';
        };
        sheetfn.selector = function(selector) {
          var i = this.length++;
          this[i] = {
            selector: selector,
            properties: []
          };
          return this;
        };
        sheetfn.css = function(name, value) {
          var i = this.length - 1;
          if (is.string(name)) {
            this[i].properties.push({
              name: name,
              value: value
            });
          } else if (is.plainObject(name)) {
            var map = name;
            for (var j = 0; j < Style.properties.length; j++) {
              var prop = Style.properties[j];
              var mapVal = map[prop.name];
              if (mapVal === undefined) {
                mapVal = map[util.dash2camel(prop.name)];
              }
              if (mapVal !== undefined) {
                var name = prop.name;
                var value = mapVal;
                this[i].properties.push({
                  name: name,
                  value: value
                });
              }
            }
          }
          return this;
        };
        sheetfn.style = sheetfn.css;
        sheetfn.generateStyle = function(cy) {
          var style = new Style(cy);
          for (var i = 0; i < this.length; i++) {
            var context = this[i];
            var selector = context.selector;
            var props = context.properties;
            style.selector(selector);
            for (var j = 0; j < props.length; j++) {
              var prop = props[j];
              style.css(prop.name, prop.value);
            }
          }
          return style;
        };
        module.exports = Stylesheet;
      }, {
        "./is": 77,
        "./style": 86,
        "./util": 94
      }],
      92: [function(_dereq_, module, exports) {
        'use strict';
        var window = _dereq_('./window');
        var util = _dereq_('./util');
        var Promise = _dereq_('./promise');
        var Event = _dereq_('./event');
        var define = _dereq_('./define');
        var is = _dereq_('./is');
        var Thread = function(opts) {
          if (!(this instanceof Thread)) {
            return new Thread(opts);
          }
          var _p = this._private = {
            requires: [],
            files: [],
            queue: null,
            pass: [],
            disabled: false
          };
          if (is.plainObject(opts)) {
            if (opts.disabled != null) {
              _p.disabled = !!opts.disabled;
            }
          }
        };
        var thdfn = Thread.prototype;
        var stringifyFieldVal = function(val) {
          var valStr = is.fn(val) ? val.toString() : "JSON.parse('" + JSON.stringify(val) + "')";
          return valStr;
        };
        var fnAsRequire = function(fn) {
          var req;
          var fnName;
          if (is.object(fn) && fn.fn) {
            req = fnAs(fn.fn, fn.name);
            fnName = fn.name;
            fn = fn.fn;
          } else if (is.fn(fn)) {
            req = fn.toString();
            fnName = fn.name;
          } else if (is.string(fn)) {
            req = fn;
          } else if (is.object(fn)) {
            if (fn.proto) {
              req = '';
            } else {
              req = fn.name + ' = {};';
            }
            fnName = fn.name;
            fn = fn.obj;
          }
          req += '\n';
          var protoreq = function(val, subname) {
            if (val.prototype) {
              var protoNonempty = false;
              for (var prop in val.prototype) {
                protoNonempty = true;
                break;
              }
              if (protoNonempty) {
                req += fnAsRequire({
                  name: subname,
                  obj: val,
                  proto: true
                }, val);
              }
            }
          };
          if (fn.prototype && fnName != null) {
            for (var name in fn.prototype) {
              var protoStr = '';
              var val = fn.prototype[name];
              var valStr = stringifyFieldVal(val);
              var subname = fnName + '.prototype.' + name;
              protoStr += subname + ' = ' + valStr + ';\n';
              if (protoStr) {
                req += protoStr;
              }
              protoreq(val, subname);
            }
          }
          if (!is.string(fn)) {
            for (var name in fn) {
              var propsStr = '';
              if (fn.hasOwnProperty(name)) {
                var val = fn[name];
                var valStr = stringifyFieldVal(val);
                var subname = fnName + '["' + name + '"]';
                propsStr += subname + ' = ' + valStr + ';\n';
              }
              if (propsStr) {
                req += propsStr;
              }
              protoreq(val, subname);
            }
          }
          return req;
        };
        var isPathStr = function(str) {
          return is.string(str) && str.match(/\.js$/);
        };
        util.extend(thdfn, {
          instanceString: function() {
            return 'thread';
          },
          require: function(fn, as) {
            var requires = this._private.requires;
            if (isPathStr(fn)) {
              this._private.files.push(fn);
              return this;
            }
            if (as) {
              if (is.fn(fn)) {
                fn = {
                  name: as,
                  fn: fn
                };
              } else {
                fn = {
                  name: as,
                  obj: fn
                };
              }
            } else {
              if (is.fn(fn)) {
                if (!fn.name) {
                  throw 'The function name could not be automatically determined.  Use thread.require( someFunction, "someFunction" )';
                }
                fn = {
                  name: fn.name,
                  fn: fn
                };
              }
            }
            requires.push(fn);
            return this;
          },
          pass: function(data) {
            this._private.pass.push(data);
            return this;
          },
          run: function(fn, pass) {
            var self = this;
            var _p = this._private;
            pass = pass || _p.pass.shift();
            if (_p.stopped) {
              throw 'Attempted to run a stopped thread!  Start a new thread or do not stop the existing thread and reuse it.';
            }
            if (_p.running) {
              return (_p.queue = _p.queue.then(function() {
                return self.run(fn, pass);
              }));
            }
            var useWW = window != null && !_p.disabled;
            var useNode = !window && typeof module !== 'undefined' && !_p.disabled;
            self.trigger('run');
            var runP = new Promise(function(resolve, reject) {
              _p.running = true;
              var threadTechAlreadyExists = _p.ran;
              var fnImplStr = is.string(fn) ? fn : fn.toString();
              var fnStr = '\n' + (_p.requires.map(function(r) {
                return fnAsRequire(r);
              })).concat(_p.files.map(function(f) {
                if (useWW) {
                  var wwifyFile = function(file) {
                    if (file.match(/^\.\//) || file.match(/^\.\./)) {
                      return window.location.origin + window.location.pathname + file;
                    } else if (file.match(/^\//)) {
                      return window.location.origin + '/' + file;
                    }
                    return file;
                  };
                  return 'importScripts("' + wwifyFile(f) + '");';
                } else if (useNode) {
                  return 'eval( require("fs").readFileSync("' + f + '", { encoding: "utf8" }) );';
                } else {
                  throw 'External file `' + f + '` can not be required without any threading technology.';
                }
              })).concat(['( function(){', 'var ret = (' + fnImplStr + ')(' + JSON.stringify(pass) + ');', 'if( ret !== undefined ){ resolve(ret); }', '} )()\n']).join('\n');
              _p.requires = [];
              _p.files = [];
              if (useWW) {
                var fnBlob,
                    fnUrl;
                if (!threadTechAlreadyExists) {
                  var fnPre = fnStr + '';
                  fnStr = ['function _ref_(o){ return eval(o); };', 'function broadcast(m){ return message(m); };', 'function message(m){ postMessage(m); };', 'function listen(fn){', '  self.addEventListener("message", function(m){ ', '    if( typeof m === "object" && (m.data.$$eval || m.data === "$$start") ){', '    } else { ', '      fn( m.data );', '    }', '  });', '};', 'self.addEventListener("message", function(m){  if( m.data.$$eval ){ eval( m.data.$$eval ); }  });', 'function resolve(v){ postMessage({ $$resolve: v }); };', 'function reject(v){ postMessage({ $$reject: v }); };'].join('\n');
                  fnStr += fnPre;
                  fnBlob = new Blob([fnStr], {type: 'application/javascript'});
                  fnUrl = window.URL.createObjectURL(fnBlob);
                }
                var ww = _p.webworker = _p.webworker || new Worker(fnUrl);
                if (threadTechAlreadyExists) {
                  ww.postMessage({$$eval: fnStr});
                }
                var cb;
                ww.addEventListener('message', cb = function(m) {
                  var isObject = is.object(m) && is.object(m.data);
                  if (isObject && ('$$resolve' in m.data)) {
                    ww.removeEventListener('message', cb);
                    resolve(m.data.$$resolve);
                  } else if (isObject && ('$$reject' in m.data)) {
                    ww.removeEventListener('message', cb);
                    reject(m.data.$$reject);
                  } else {
                    self.trigger(new Event(m, {
                      type: 'message',
                      message: m.data
                    }));
                  }
                }, false);
                if (!threadTechAlreadyExists) {
                  ww.postMessage('$$start');
                }
              } else if (useNode) {
                if (!_p.child) {
                  _p.child = (_dereq_('child_process').fork(_dereq_('path').join(__dirname, 'thread-node-fork')));
                }
                var child = _p.child;
                var cb;
                child.on('message', cb = function(m) {
                  if (is.object(m) && ('$$resolve' in m)) {
                    child.removeListener('message', cb);
                    resolve(m.$$resolve);
                  } else if (is.object(m) && ('$$reject' in m)) {
                    child.removeListener('message', cb);
                    reject(m.$$reject);
                  } else {
                    self.trigger(new Event({}, {
                      type: 'message',
                      message: m
                    }));
                  }
                });
                child.send({$$eval: fnStr});
              } else {
                var promiseResolve = resolve;
                var promiseReject = reject;
                var timer = _p.timer = _p.timer || {
                  listeners: [],
                  exec: function() {
                    fnStr = ['function _ref_(o){ return eval(o); };', 'function broadcast(m){ return message(m); };', 'function message(m){ self.trigger( new Event({}, { type: "message", message: m }) ); };', 'function listen(fn){ timer.listeners.push( fn ); };', 'function resolve(v){ promiseResolve(v); };', 'function reject(v){ promiseReject(v); };'].join('\n') + fnStr;
                    eval(fnStr);
                  },
                  message: function(m) {
                    var ls = timer.listeners;
                    for (var i = 0; i < ls.length; i++) {
                      var fn = ls[i];
                      fn(m);
                    }
                  }
                };
                timer.exec();
              }
            }).then(function(v) {
              _p.running = false;
              _p.ran = true;
              self.trigger('ran');
              return v;
            });
            if (_p.queue == null) {
              _p.queue = runP;
            }
            return runP;
          },
          message: function(m) {
            var _p = this._private;
            if (_p.webworker) {
              _p.webworker.postMessage(m);
            }
            if (_p.child) {
              _p.child.send(m);
            }
            if (_p.timer) {
              _p.timer.message(m);
            }
            return this;
          },
          stop: function() {
            var _p = this._private;
            if (_p.webworker) {
              _p.webworker.terminate();
            }
            if (_p.child) {
              _p.child.kill();
            }
            if (_p.timer) {}
            _p.stopped = true;
            return this.trigger('stop');
          },
          stopped: function() {
            return this._private.stopped;
          }
        });
        var fnAs = function(fn, name) {
          var fnStr = fn.toString();
          fnStr = fnStr.replace(/function\s*?\S*?\s*?\(/, 'function ' + name + '(');
          return fnStr;
        };
        var defineFnal = function(opts) {
          opts = opts || {};
          return function fnalImpl(fn, arg1) {
            var fnStr = fnAs(fn, '_$_$_' + opts.name);
            this.require(fnStr);
            return this.run(['function( data ){', '  var origResolve = resolve;', '  var res = [];', '  ', '  resolve = function( val ){', '    res.push( val );', '  };', '  ', '  var ret = data.' + opts.name + '( _$_$_' + opts.name + (arguments.length > 1 ? ', ' + JSON.stringify(arg1) : '') + ' );', '  ', '  resolve = origResolve;', '  resolve( res.length > 0 ? res : ret );', '}'].join('\n'));
          };
        };
        util.extend(thdfn, {
          reduce: defineFnal({name: 'reduce'}),
          reduceRight: defineFnal({name: 'reduceRight'}),
          map: defineFnal({name: 'map'})
        });
        var fn = thdfn;
        fn.promise = fn.run;
        fn.terminate = fn.halt = fn.stop;
        fn.include = fn.require;
        util.extend(thdfn, {
          on: define.on(),
          one: define.on({unbindSelfOnTrigger: true}),
          off: define.off(),
          trigger: define.trigger()
        });
        define.eventAliasesOn(thdfn);
        module.exports = Thread;
      }, {
        "./define": 41,
        "./event": 42,
        "./is": 77,
        "./promise": 80,
        "./util": 94,
        "./window": 100,
        "child_process": undefined,
        "path": undefined
      }],
      93: [function(_dereq_, module, exports) {
        'use strict';
        var is = _dereq_('../is');
        module.exports = {
          hex2tuple: function(hex) {
            if (!(hex.length === 4 || hex.length === 7) || hex[0] !== "#") {
              return;
            }
            var shortHex = hex.length === 4;
            var r,
                g,
                b;
            var base = 16;
            if (shortHex) {
              r = parseInt(hex[1] + hex[1], base);
              g = parseInt(hex[2] + hex[2], base);
              b = parseInt(hex[3] + hex[3], base);
            } else {
              r = parseInt(hex[1] + hex[2], base);
              g = parseInt(hex[3] + hex[4], base);
              b = parseInt(hex[5] + hex[6], base);
            }
            return [r, g, b];
          },
          hsl2tuple: function(hsl) {
            var ret;
            var h,
                s,
                l,
                a,
                r,
                g,
                b;
            function hue2rgb(p, q, t) {
              if (t < 0)
                t += 1;
              if (t > 1)
                t -= 1;
              if (t < 1 / 6)
                return p + (q - p) * 6 * t;
              if (t < 1 / 2)
                return q;
              if (t < 2 / 3)
                return p + (q - p) * (2 / 3 - t) * 6;
              return p;
            }
            var m = new RegExp("^" + this.regex.hsla + "$").exec(hsl);
            if (m) {
              h = parseInt(m[1]);
              if (h < 0) {
                h = (360 - (-1 * h % 360)) % 360;
              } else if (h > 360) {
                h = h % 360;
              }
              h /= 360;
              s = parseFloat(m[2]);
              if (s < 0 || s > 100) {
                return;
              }
              s = s / 100;
              l = parseFloat(m[3]);
              if (l < 0 || l > 100) {
                return;
              }
              l = l / 100;
              a = m[4];
              if (a !== undefined) {
                a = parseFloat(a);
                if (a < 0 || a > 1) {
                  return;
                }
              }
              if (s === 0) {
                r = g = b = Math.round(l * 255);
              } else {
                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r = Math.round(255 * hue2rgb(p, q, h + 1 / 3));
                g = Math.round(255 * hue2rgb(p, q, h));
                b = Math.round(255 * hue2rgb(p, q, h - 1 / 3));
              }
              ret = [r, g, b, a];
            }
            return ret;
          },
          rgb2tuple: function(rgb) {
            var ret;
            var m = new RegExp("^" + this.regex.rgba + "$").exec(rgb);
            if (m) {
              ret = [];
              var isPct = [];
              for (var i = 1; i <= 3; i++) {
                var channel = m[i];
                if (channel[channel.length - 1] === "%") {
                  isPct[i] = true;
                }
                channel = parseFloat(channel);
                if (isPct[i]) {
                  channel = channel / 100 * 255;
                }
                if (channel < 0 || channel > 255) {
                  return;
                }
                ret.push(Math.floor(channel));
              }
              var atLeastOneIsPct = isPct[1] || isPct[2] || isPct[3];
              var allArePct = isPct[1] && isPct[2] && isPct[3];
              if (atLeastOneIsPct && !allArePct) {
                return;
              }
              var alpha = m[4];
              if (alpha !== undefined) {
                alpha = parseFloat(alpha);
                if (alpha < 0 || alpha > 1) {
                  return;
                }
                ret.push(alpha);
              }
            }
            return ret;
          },
          colorname2tuple: function(color) {
            return this.colors[color.toLowerCase()];
          },
          color2tuple: function(color) {
            return (is.array(color) ? color : null) || this.colorname2tuple(color) || this.hex2tuple(color) || this.rgb2tuple(color) || this.hsl2tuple(color);
          },
          colors: {
            transparent: [0, 0, 0, 0],
            aliceblue: [240, 248, 255],
            antiquewhite: [250, 235, 215],
            aqua: [0, 255, 255],
            aquamarine: [127, 255, 212],
            azure: [240, 255, 255],
            beige: [245, 245, 220],
            bisque: [255, 228, 196],
            black: [0, 0, 0],
            blanchedalmond: [255, 235, 205],
            blue: [0, 0, 255],
            blueviolet: [138, 43, 226],
            brown: [165, 42, 42],
            burlywood: [222, 184, 135],
            cadetblue: [95, 158, 160],
            chartreuse: [127, 255, 0],
            chocolate: [210, 105, 30],
            coral: [255, 127, 80],
            cornflowerblue: [100, 149, 237],
            cornsilk: [255, 248, 220],
            crimson: [220, 20, 60],
            cyan: [0, 255, 255],
            darkblue: [0, 0, 139],
            darkcyan: [0, 139, 139],
            darkgoldenrod: [184, 134, 11],
            darkgray: [169, 169, 169],
            darkgreen: [0, 100, 0],
            darkgrey: [169, 169, 169],
            darkkhaki: [189, 183, 107],
            darkmagenta: [139, 0, 139],
            darkolivegreen: [85, 107, 47],
            darkorange: [255, 140, 0],
            darkorchid: [153, 50, 204],
            darkred: [139, 0, 0],
            darksalmon: [233, 150, 122],
            darkseagreen: [143, 188, 143],
            darkslateblue: [72, 61, 139],
            darkslategray: [47, 79, 79],
            darkslategrey: [47, 79, 79],
            darkturquoise: [0, 206, 209],
            darkviolet: [148, 0, 211],
            deeppink: [255, 20, 147],
            deepskyblue: [0, 191, 255],
            dimgray: [105, 105, 105],
            dimgrey: [105, 105, 105],
            dodgerblue: [30, 144, 255],
            firebrick: [178, 34, 34],
            floralwhite: [255, 250, 240],
            forestgreen: [34, 139, 34],
            fuchsia: [255, 0, 255],
            gainsboro: [220, 220, 220],
            ghostwhite: [248, 248, 255],
            gold: [255, 215, 0],
            goldenrod: [218, 165, 32],
            gray: [128, 128, 128],
            grey: [128, 128, 128],
            green: [0, 128, 0],
            greenyellow: [173, 255, 47],
            honeydew: [240, 255, 240],
            hotpink: [255, 105, 180],
            indianred: [205, 92, 92],
            indigo: [75, 0, 130],
            ivory: [255, 255, 240],
            khaki: [240, 230, 140],
            lavender: [230, 230, 250],
            lavenderblush: [255, 240, 245],
            lawngreen: [124, 252, 0],
            lemonchiffon: [255, 250, 205],
            lightblue: [173, 216, 230],
            lightcoral: [240, 128, 128],
            lightcyan: [224, 255, 255],
            lightgoldenrodyellow: [250, 250, 210],
            lightgray: [211, 211, 211],
            lightgreen: [144, 238, 144],
            lightgrey: [211, 211, 211],
            lightpink: [255, 182, 193],
            lightsalmon: [255, 160, 122],
            lightseagreen: [32, 178, 170],
            lightskyblue: [135, 206, 250],
            lightslategray: [119, 136, 153],
            lightslategrey: [119, 136, 153],
            lightsteelblue: [176, 196, 222],
            lightyellow: [255, 255, 224],
            lime: [0, 255, 0],
            limegreen: [50, 205, 50],
            linen: [250, 240, 230],
            magenta: [255, 0, 255],
            maroon: [128, 0, 0],
            mediumaquamarine: [102, 205, 170],
            mediumblue: [0, 0, 205],
            mediumorchid: [186, 85, 211],
            mediumpurple: [147, 112, 219],
            mediumseagreen: [60, 179, 113],
            mediumslateblue: [123, 104, 238],
            mediumspringgreen: [0, 250, 154],
            mediumturquoise: [72, 209, 204],
            mediumvioletred: [199, 21, 133],
            midnightblue: [25, 25, 112],
            mintcream: [245, 255, 250],
            mistyrose: [255, 228, 225],
            moccasin: [255, 228, 181],
            navajowhite: [255, 222, 173],
            navy: [0, 0, 128],
            oldlace: [253, 245, 230],
            olive: [128, 128, 0],
            olivedrab: [107, 142, 35],
            orange: [255, 165, 0],
            orangered: [255, 69, 0],
            orchid: [218, 112, 214],
            palegoldenrod: [238, 232, 170],
            palegreen: [152, 251, 152],
            paleturquoise: [175, 238, 238],
            palevioletred: [219, 112, 147],
            papayawhip: [255, 239, 213],
            peachpuff: [255, 218, 185],
            peru: [205, 133, 63],
            pink: [255, 192, 203],
            plum: [221, 160, 221],
            powderblue: [176, 224, 230],
            purple: [128, 0, 128],
            red: [255, 0, 0],
            rosybrown: [188, 143, 143],
            royalblue: [65, 105, 225],
            saddlebrown: [139, 69, 19],
            salmon: [250, 128, 114],
            sandybrown: [244, 164, 96],
            seagreen: [46, 139, 87],
            seashell: [255, 245, 238],
            sienna: [160, 82, 45],
            silver: [192, 192, 192],
            skyblue: [135, 206, 235],
            slateblue: [106, 90, 205],
            slategray: [112, 128, 144],
            slategrey: [112, 128, 144],
            snow: [255, 250, 250],
            springgreen: [0, 255, 127],
            steelblue: [70, 130, 180],
            tan: [210, 180, 140],
            teal: [0, 128, 128],
            thistle: [216, 191, 216],
            tomato: [255, 99, 71],
            turquoise: [64, 224, 208],
            violet: [238, 130, 238],
            wheat: [245, 222, 179],
            white: [255, 255, 255],
            whitesmoke: [245, 245, 245],
            yellow: [255, 255, 0],
            yellowgreen: [154, 205, 50]
          }
        };
      }, {"../is": 77}],
      94: [function(_dereq_, module, exports) {
        'use strict';
        var is = _dereq_('../is');
        var math = _dereq_('../math');
        var util = {
          falsify: function() {
            return false;
          },
          zeroify: function() {
            return 0;
          },
          noop: function() {},
          error: function(msg) {
            if (console.error) {
              console.error.apply(console, arguments);
              if (console.trace) {
                console.trace();
              }
            } else {
              console.log.apply(console, arguments);
              if (console.trace) {
                console.trace();
              }
            }
          },
          clone: function(obj) {
            return this.extend({}, obj);
          },
          copy: function(obj) {
            if (obj == null) {
              return obj;
            }
            if (is.array(obj)) {
              return obj.slice();
            } else if (is.plainObject(obj)) {
              return this.clone(obj);
            } else {
              return obj;
            }
          }
        };
        util.makeBoundingBox = math.makeBoundingBox.bind(math);
        util._staticEmptyObject = {};
        util.staticEmptyObject = function() {
          return util._staticEmptyObject;
        };
        util.extend = Object.assign != null ? Object.assign : function(tgt) {
          var args = arguments;
          for (var i = 1; i < args.length; i++) {
            var obj = args[i];
            for (var k in obj) {
              tgt[k] = obj[k];
            }
          }
          return tgt;
        };
        [_dereq_('./colors'), _dereq_('./maps'), {memoize: _dereq_('./memoize')}, _dereq_('./regex'), _dereq_('./strings'), _dereq_('./timing')].forEach(function(req) {
          util.extend(util, req);
        });
        module.exports = util;
      }, {
        "../is": 77,
        "../math": 79,
        "./colors": 93,
        "./maps": 95,
        "./memoize": 96,
        "./regex": 97,
        "./strings": 98,
        "./timing": 99
      }],
      95: [function(_dereq_, module, exports) {
        'use strict';
        var is = _dereq_('../is');
        module.exports = {
          mapEmpty: function(map) {
            var empty = true;
            if (map != null) {
              for (var i in map) {
                empty = false;
                break;
              }
            }
            return empty;
          },
          pushMap: function(options) {
            var array = this.getMap(options);
            if (array == null) {
              this.setMap(this.extend({}, options, {value: [options.value]}));
            } else {
              array.push(options.value);
            }
          },
          setMap: function(options) {
            var obj = options.map;
            var key;
            var keys = options.keys;
            var l = keys.length;
            for (var i = 0; i < l; i++) {
              var key = keys[i];
              if (is.plainObject(key)) {
                this.error('Tried to set map with object key');
              }
              if (i < keys.length - 1) {
                if (obj[key] == null) {
                  obj[key] = {};
                }
                obj = obj[key];
              } else {
                obj[key] = options.value;
              }
            }
          },
          getMap: function(options) {
            var obj = options.map;
            var keys = options.keys;
            var l = keys.length;
            for (var i = 0; i < l; i++) {
              var key = keys[i];
              if (is.plainObject(key)) {
                this.error('Tried to get map with object key');
              }
              obj = obj[key];
              if (obj == null) {
                return obj;
              }
            }
            return obj;
          },
          deleteMap: function(options) {
            var obj = options.map;
            var keys = options.keys;
            var l = keys.length;
            var keepChildren = options.keepChildren;
            for (var i = 0; i < l; i++) {
              var key = keys[i];
              if (is.plainObject(key)) {
                this.error('Tried to delete map with object key');
              }
              var lastKey = i === options.keys.length - 1;
              if (lastKey) {
                if (keepChildren) {
                  for (var child in obj) {
                    if (!keepChildren[child]) {
                      obj[child] = undefined;
                    }
                  }
                } else {
                  obj[key] = undefined;
                }
              } else {
                obj = obj[key];
              }
            }
          }
        };
      }, {"../is": 77}],
      96: [function(_dereq_, module, exports) {
        'use strict';
        module.exports = function memoize(fn, keyFn) {
          var self = this;
          var cache = {};
          if (!keyFn) {
            keyFn = function() {
              if (arguments.length === 1) {
                return arguments[0];
              }
              var args = [];
              for (var i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
              }
              return args.join('$');
            };
          }
          return function memoizedFn() {
            var args = arguments;
            var ret;
            var k = keyFn.apply(self, args);
            if (!(ret = cache[k])) {
              ret = cache[k] = fn.apply(self, args);
            }
            return ret;
          };
        };
      }, {}],
      97: [function(_dereq_, module, exports) {
        'use strict';
        var number = "(?:[-+]?(?:(?:\\d+|\\d*\\.\\d+)(?:[Ee][+-]?\\d+)?))";
        var rgba = "rgb[a]?\\((" + number + "[%]?)\\s*,\\s*(" + number + "[%]?)\\s*,\\s*(" + number + "[%]?)(?:\\s*,\\s*(" + number + "))?\\)";
        var rgbaNoBackRefs = "rgb[a]?\\((?:" + number + "[%]?)\\s*,\\s*(?:" + number + "[%]?)\\s*,\\s*(?:" + number + "[%]?)(?:\\s*,\\s*(?:" + number + "))?\\)";
        var hsla = "hsl[a]?\\((" + number + ")\\s*,\\s*(" + number + "[%])\\s*,\\s*(" + number + "[%])(?:\\s*,\\s*(" + number + "))?\\)";
        var hslaNoBackRefs = "hsl[a]?\\((?:" + number + ")\\s*,\\s*(?:" + number + "[%])\\s*,\\s*(?:" + number + "[%])(?:\\s*,\\s*(?:" + number + "))?\\)";
        var hex3 = "\\#[0-9a-fA-F]{3}";
        var hex6 = "\\#[0-9a-fA-F]{6}";
        module.exports = {regex: {
            number: number,
            rgba: rgba,
            rgbaNoBackRefs: rgbaNoBackRefs,
            hsla: hsla,
            hslaNoBackRefs: hslaNoBackRefs,
            hex3: hex3,
            hex6: hex6
          }};
      }, {}],
      98: [function(_dereq_, module, exports) {
        'use strict';
        var memoize = _dereq_('./memoize');
        var is = _dereq_('../is');
        module.exports = {
          camel2dash: memoize(function(str) {
            return str.replace(/([A-Z])/g, function(v) {
              return '-' + v.toLowerCase();
            });
          }),
          dash2camel: memoize(function(str) {
            return str.replace(/(-\w)/g, function(v) {
              return v[1].toUpperCase();
            });
          }),
          capitalize: function(str) {
            if (is.emptyString(str)) {
              return str;
            }
            return str.charAt(0).toUpperCase() + str.substring(1);
          }
        };
      }, {
        "../is": 77,
        "./memoize": 96
      }],
      99: [function(_dereq_, module, exports) {
        'use strict';
        var window = _dereq_('../window');
        var is = _dereq_('../is');
        var performance = window ? window.performance : null;
        var util = {};
        var raf = !window ? null : (window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame);
        raf = raf || function(fn) {
          if (fn) {
            setTimeout(function() {
              fn(pnow());
            }, 1000 / 60);
          }
        };
        util.requestAnimationFrame = function(fn) {
          raf(fn);
        };
        var pnow = performance && performance.now ? function() {
          return performance.now();
        } : function() {
          return Date.now();
        };
        util.performanceNow = pnow;
        util.throttle = function(func, wait, options) {
          var leading = true,
              trailing = true;
          if (options === false) {
            leading = false;
          } else if (is.plainObject(options)) {
            leading = 'leading' in options ? options.leading : leading;
            trailing = 'trailing' in options ? options.trailing : trailing;
          }
          options = options || {};
          options.leading = leading;
          options.maxWait = wait;
          options.trailing = trailing;
          return util.debounce(func, wait, options);
        };
        util.now = function() {
          return Date.now();
        };
        util.debounce = function(func, wait, options) {
          var util = this;
          var args,
              maxTimeoutId,
              result,
              stamp,
              thisArg,
              timeoutId,
              trailingCall,
              lastCalled = 0,
              maxWait = false,
              trailing = true;
          if (!is.fn(func)) {
            return;
          }
          wait = Math.max(0, wait) || 0;
          if (options === true) {
            var leading = true;
            trailing = false;
          } else if (is.plainObject(options)) {
            leading = options.leading;
            maxWait = 'maxWait' in options && (Math.max(wait, options.maxWait) || 0);
            trailing = 'trailing' in options ? options.trailing : trailing;
          }
          var delayed = function() {
            var remaining = wait - (util.now() - stamp);
            if (remaining <= 0) {
              if (maxTimeoutId) {
                clearTimeout(maxTimeoutId);
              }
              var isCalled = trailingCall;
              maxTimeoutId = timeoutId = trailingCall = undefined;
              if (isCalled) {
                lastCalled = util.now();
                result = func.apply(thisArg, args);
                if (!timeoutId && !maxTimeoutId) {
                  args = thisArg = null;
                }
              }
            } else {
              timeoutId = setTimeout(delayed, remaining);
            }
          };
          var maxDelayed = function() {
            if (timeoutId) {
              clearTimeout(timeoutId);
            }
            maxTimeoutId = timeoutId = trailingCall = undefined;
            if (trailing || (maxWait !== wait)) {
              lastCalled = util.now();
              result = func.apply(thisArg, args);
              if (!timeoutId && !maxTimeoutId) {
                args = thisArg = null;
              }
            }
          };
          return function() {
            args = arguments;
            stamp = util.now();
            thisArg = this;
            trailingCall = trailing && (timeoutId || !leading);
            if (maxWait === false) {
              var leadingCall = leading && !timeoutId;
            } else {
              if (!maxTimeoutId && !leading) {
                lastCalled = stamp;
              }
              var remaining = maxWait - (stamp - lastCalled),
                  isCalled = remaining <= 0;
              if (isCalled) {
                if (maxTimeoutId) {
                  maxTimeoutId = clearTimeout(maxTimeoutId);
                }
                lastCalled = stamp;
                result = func.apply(thisArg, args);
              } else if (!maxTimeoutId) {
                maxTimeoutId = setTimeout(maxDelayed, remaining);
              }
            }
            if (isCalled && timeoutId) {
              timeoutId = clearTimeout(timeoutId);
            } else if (!timeoutId && wait !== maxWait) {
              timeoutId = setTimeout(delayed, wait);
            }
            if (leadingCall) {
              isCalled = true;
              result = func.apply(thisArg, args);
            }
            if (isCalled && !timeoutId && !maxTimeoutId) {
              args = thisArg = null;
            }
            return result;
          };
        };
        module.exports = util;
      }, {
        "../is": 77,
        "../window": 100
      }],
      100: [function(_dereq_, module, exports) {
        module.exports = (typeof window === 'undefined' ? null : window);
      }, {}]
    }, {}, [76])(76);
  });
})(require('process'));
