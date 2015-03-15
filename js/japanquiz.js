/* global d3, Datamap, window */
(function () {
    "use strict";

    var PREF_NUM = 47,
        prefGeos = {},
        geographyConfig,

        DEF_W = 800,
        DEF_H = 800,

        FLAG_X = 50,
        FLAG_Y = 180,
        FLAG_W = 180,
        FLAG_H = 120,

        maruCX,
        maruCY,

        MAX_MISTAKABLE = 3,
        MAX_SKIPPABLE = 3,

        COLOR_OFF = "#888",
        COLOR_BSO_B = "#28CC8F",
        COLOR_BSO_S = "#E9D912",
        COLOR_BSO_O = "#E43E24",

        MODE_PREF = 0,
        DEFAULT_MODE = 0,

        MODE = [
            { label: "都道府県", selected: true },
            { label: "県庁所在地" }
        ],

        DEFAULT_REGION = 0,

        REGIONS = [
            { label: "全て", idRange: [ 1, 47 ], selected: true },
            { label: "北海道・東北", idRange: [ 1, 7 ] },
            { label: "関東", idRange: [ 8, 14 ] },
            { label: "中部", idRange: [ 15, 23 ] },
            { label: "近畿", idRange: [ 24, 30 ] },
            { label: "中国", idRange: [ 31, 35 ] },
            { label: "四国", idRange: [ 36, 39 ] },
            { label: "九州・沖縄", idRange: [ 40, 47 ] },
            { label: "練習", idRange: [ 1, 0 ] }
        ],

        prefCenter = [ [ 0, 0 ] ],

        prefTbl = [
            { name: "", kana: "", capital: "" },
            { name: "北海道", kana: "ほっかいどう", capital: "札幌" },
            { name: "青森県", kana: "あおもり", capital: "青森" },
            { name: "岩手県", kana: "いわて", capital: "盛岡" },
            { name: "宮城県", kana: "みやぎ", capital: "仙台" },
            { name: "秋田県", kana: "あきた", capital: "秋田" },
            { name: "山形県", kana: "やまがた", capital: "山形" },
            { name: "福島県", kana: "ふくしま", capital: "福島" },
            { name: "茨城県", kana: "いばらき", capital: "水戸" },
            { name: "栃木県", kana: "とちぎ", capital: "宇都宮" },
            { name: "群馬県", kana: "ぐんま", capital: "前橋" },
            { name: "埼玉県", kana: "さいたま", capital: "さいたま" },
            { name: "千葉県", kana: "ちば", capital: "千葉" },
            { name: "東京都", kana: "とうきょう", capital: "東京（新宿区）" },
            { name: "神奈川県", kana: "かながわ", capital: "横浜" },
            { name: "新潟県", kana: "にいがた", capital: "新潟" },
            { name: "富山県", kana: "とやま", capital: "富山" },
            { name: "石川県", kana: "いしかわ", capital: "金沢" },
            { name: "福井県", kana: "ふくい", capital: "福井" },
            { name: "山梨県", kana: "やまなし", capital: "甲府" },
            { name: "長野県", kana: "ながの", capital: "長野" },
            { name: "岐阜県", kana: "ぎふ", capital: "岐阜" },
            { name: "静岡県", kana: "しずおか", capital: "静岡" },
            { name: "愛知県", kana: "あいち", capital: "名古屋" },
            { name: "三重県", kana: "みえ", capital: "津" },
            { name: "滋賀県", kana: "しが", capital: "大津" },
            { name: "京都府", kana: "きょうと", capital: "京都" },
            { name: "大阪府", kana: "おおさか", capital: "大阪" },
            { name: "兵庫県", kana: "ひょうご", capital: "神戸" },
            { name: "奈良県", kana: "なら", capital: "奈良" },
            { name: "和歌山県", kana: "わかやま", capital: "和歌山" },
            { name: "鳥取県", kana: "とっとり", capital: "鳥取" },
            { name: "島根県", kana: "しまね", capital: "松江" },
            { name: "岡山県", kana: "おかやま", capital: "岡山" },
            { name: "広島県", kana: "ひろしま", capital: "広島" },
            { name: "山口県", kana: "やまぐち", capital: "山口" },
            { name: "徳島県", kana: "とくしま", capital: "徳島" },
            { name: "香川県", kana: "かがわ", capital: "高松" },
            { name: "愛媛県", kana: "えひめ", capital: "松山" },
            { name: "高知県", kana: "こうち", capital: "高知" },
            { name: "福岡県", kana: "ふくおか", capital: "福岡" },
            { name: "佐賀県", kana: "さが", capital: "佐賀" },
            { name: "長崎県", kana: "ながさき", capital: "長崎" },
            { name: "熊本県", kana: "くまもと", capital: "熊本" },
            { name: "大分県", kana: "おおいた", capital: "大分" },
            { name: "宮崎県", kana: "みやざき", capital: "宮崎" },
            { name: "鹿児島県", kana: "かごしま", capital: "鹿児島" },
            { name: "沖縄県", kana: "おきなわ", capital: "那覇" }
        ],

        prefFillIndex = [ 0, 0, 1, 3, 0, 2,
                             1, 2, 3, 0, 1,
                             0, 2, 3, 1, 3,
                             1, 0, 1, 2, 0,
                             2, 3, 1, 3, 0,

                             2, 1, 3, 0, 2,
                             2, 3, 0, 1, 2,
                             1, 2, 3, 0, 0,
                             3, 1, 2, 3, 0,
                             1, 3 ],

        myfills = [ "#A8FFA0", "#C2A0FF", "#FFFFA0", "#FFA0A0" ];


    function init() {
        var i, numText;

        for (i = 0; i < REGIONS.length; i++) {
            numText = " (" + (REGIONS[i].idRange[1] - REGIONS[i].idRange[0] + 1) + ")";
            REGIONS[i].label += numText;
        }
    }


    function shuffle(arr) {
        var currentIndex = arr.length, temporaryValue, randomIndex;

        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            temporaryValue = arr[currentIndex];
            arr[currentIndex] = arr[randomIndex];
            arr[randomIndex] = temporaryValue;
        }

        return arr;
    }


    function addQuestionPlugin(map, quiz) {
        map.addPlugin("addQuestionText", function (layer) {
            geographyConfig = this.options.geographyConfig;

            quiz.d3.q = layer
                .append("text")
                .attr("x", DEF_W / 3)
                .attr("y", 50)
                .style("text-anchor", "middle")
                .style("font-size", "36px")
                .style("font-weight", "bold")
                .text("");

            quiz.d3.msg = layer
                .append("text")
                .attr("x", DEF_W / 3)
                .attr("y", 80)
                .style("fill", "red")
                .style("text-anchor", "middle")
                .style("font-size", "20px")
                .style("font-weight", "bold")
                .text("");
        });

        map.addQuestionText();
    }


    function addFlagPlugin(map, quiz) {
        map.addPlugin("createFlag", function (layer) {
            var cx = FLAG_X + (FLAG_W / 2),
                cy = FLAG_Y + (FLAG_H / 2),
                r = FLAG_H * 0.3;

            quiz.d3.flagLayer = layer;

            layer
                .append("rect")
                .attr("x", FLAG_X)
                .attr("y", FLAG_Y)
                .attr("width", FLAG_W)
                .attr("height", FLAG_H)
                .style("stroke", "#000")
                .style("fill", "#FFF")
                .style("stroke-width", 1);

            maruCX = cx;
            maruCY = cy;

            quiz.d3.maru = layer.append("circle")
                .attr("cx", cx)
                .attr("cy", cy)
                .attr("r", r)
                .style("fill", "#BC002D")
                .on("click", function () {
                    if (quiz.curPos < quiz.prefsNum) {
                        quiz.bso.b++;
                        quiz.setBSO();
                    }
                });

            quiz.d3.batsu = layer.append("g")
                .attr("id", "flag-batsu");

            quiz.d3.batsu
                .append("line")
                .attr("x1", cx - r)
                .attr("y1", cy - r)
                .attr("x2", cx + r)
                .attr("y2", cy + r)
                .style("stroke", "#BC002D")
                .style("stroke-width", 20);

            quiz.d3.batsu
                .append("line")
                .attr("x1", cx + r)
                .attr("y1", cy - r)
                .attr("x2", cx - r)
                .attr("y2", cy + r)
                .style("stroke", "#BC002D")
                .style("stroke-width", 20);
        });

        map.createFlag();
    }


    function addBaseBallPlugin(map, quiz) {
        map.addPlugin("playBall", function (layer) {
            var i,
                BSO_X = DEF_W - 140,
                BSO_Y = 400,
                strikeY = BSO_Y + 22,
                ballY = strikeY + 30,
                outY = ballY + 30,
                ballR = 10;

            layer
                .append("rect")
                .attr("x", BSO_X)
                .attr("y", BSO_Y)
                .attr("width", 112)
                .attr("height", 97)
                .style("stroke", "#000")
                .style("fill", "#333")
                .style("stroke-width", 1);

            layer
                .append("text")
                .attr("x", BSO_X + 10)
                .attr("y", ballY)
                .style("fill", "#FFF")
                .style("font-size", "16px")
                .style("font-weight", "bold")
                .text("B");

            for (i = 0; i < 3; i++) {
                quiz.d3["ball-" + i] = layer
                    .append("circle")
                    .attr("id", "bso-ball-" + i)
                    .attr("cx", BSO_X + 40 + (i * 25))
                    .attr("cy", ballY - (ballR / 2))
                    .attr("r", ballR)
                    .style("fill", "#FFF")
                    .style("stroke", "#000")
                    .style("stroke-width", 1);
            }

            layer
                .append("text")
                .attr("x", BSO_X + 10)
                .attr("y", strikeY)
                .style("fill", "#FFF")
                .style("font-size", "16px")
                .style("font-weight", "bold")
                .text("S");

            for (i = 0; i < 2; i++) {
                quiz.d3["strike-" + i] = layer
                    .append("circle")
                    .attr("id", "bso-strike-" + i)
                    .attr("cx", BSO_X + 40 + (i * 25))
                    .attr("cy", strikeY - (ballR / 2))
                    .attr("r", ballR)
                    .style("fill", "#FFF")
                    .style("stroke", "#000")
                    .style("stroke-width", 1);
            }

            layer
                .append("text")
                .attr("x", BSO_X + 10)
                .attr("y", outY)
                .style("fill", "#FFF")
                .style("font-size", "16px")
                .style("font-weight", "bold")
                .text("O");

            for (i = 0; i < 2; i++) {
                quiz.d3["out-" + i] = layer
                    .append("circle")
                    .attr("id", "bso-out-" + i)
                    .attr("cx", BSO_X + 40 + (i * 25))
                    .attr("cy", outY - (ballR / 2))
                    .attr("r", ballR)
                    .style("fill", "#FFF")
                    .style("stroke", "#000")
                    .style("stroke-width", 1);
            }
        });

        map.playBall();
    }


    function eventMouseOver(prefID) {
        var g = prefGeos[prefID],
            geo = d3.select(g.geo),
            options = geographyConfig,
            previousAttributes;

        if (g.ex !== undefined) {
            g.ex.style("fill", options.highlightFillColor);
        }

        previousAttributes = {
          "fill": geo.style("fill"),
          "stroke": geo.style("stroke"),
          "stroke-width": geo.style("stroke-width"),
          "fill-opacity": geo.style("fill-opacity")
        };

        geo
          .style("fill", options.highlightFillColor)
          .style("stroke", options.highlightBorderColor)
          .style("stroke-width", options.highlightBorderWidth)
          .style("fill-opacity", options.highlightFillOpacity)
          .attr("data-previousAttributes", JSON.stringify( previousAttributes));
    }


    function eventMouseOut(prefID) {
        var g = prefGeos[prefID],
            geo = d3.select(g.geo),
            attr,
            previousAttributes;

        if (g.ex !== undefined) {
            g.ex.style("fill", myfills[prefID % myfills.length]);
        }

        previousAttributes = JSON.parse(geo.attr("data-previousAttributes"));
        for (attr in previousAttributes) {
            if (previousAttributes.hasOwnProperty(attr)) {
                geo.style( attr, previousAttributes[attr]);
            }
        }
    }


    function clickGeography(geo, quiz) {
        var i, x, y, kana, answerID, result, clearPrevClickID = false;

        if (quiz.curPos >= quiz.prefsNum) {
            quiz.d3.msg.text(quiz.getName(geo.id));

            return;
        }

        if (geo.id === quiz.prevClickPrefID) {
            return;
        }

        answerID = quiz.qIDs[quiz.curPos];
        result = d3.select("#td-result-" + answerID);

        if (geo.id === answerID) {
            quiz.d3.msg.text("");

            quiz.d3.maru.attr("visibility", "visible");
            quiz.d3.batsu.attr("visibility", "hidden");

            result.html(result.html() + "<span class=\"correct\">O</span>");

            x = prefCenter[answerID][0];
            y = prefCenter[answerID][1];

            kana = prefTbl[answerID].kana;

            for (i = 0; i < kana.length; i++) {
                quiz.d3.flagLayer
                    .append("text")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("dy", ".35em")
                    .text(kana[i])
                    .transition()
                    .duration(200 * i)
                    .attr("transform", ["translate( 0, 0 )"].join(""))
                    .transition()
                    .duration(2000)
                    .attr("transform", ["translate( ", maruCX - x, ", ", maruCY - y, " )"].join(""))
                    .transition()
                    .duration(100)
                    .remove();
            }

            quiz.nextQuestion();
        } else {
            quiz.d3.msg.text(" そこは " + quiz.getName(geo.id));

            quiz.bso.s++;
            result.html(result.html() + "<span class=\"mistakes\">X</span>");

            quiz.d3.maru.attr("visibility", "hidden");
            quiz.d3.batsu.attr("visibility", "visible");

            if (quiz.bso.s < MAX_MISTAKABLE) {
                quiz.setBSO();
            } else {
                quiz.bso.o++;

                clearPrevClickID = true;

                if (quiz.bso.o < MAX_SKIPPABLE) {
                    quiz.nextQuestion();
                } else {
                    quiz.curPos = quiz.prefsNum + 1;
                    quiz.d3.q.text("スリーアウト チェンジ！");
                }
            }
        }

        if (clearPrevClickID) {
            quiz.prevClickPrefID = "";
        } else {
            quiz.prevClickPrefID = geo.id;
        }
    }


    function createPrefTable(container) {
        var table,
            prefs = [null],
            i, j, data = [], chunk = 5 * 3, columns = [],
            rows;

        table = container.append("table")
            .attr("id", "prefs-table")
            .attr("class", "prefs-table");

        for (i = 0; i < chunk; i++) {
            columns.push(i);
        }

        for (i = 1; i <= PREF_NUM; i++) {
            prefs.push({name: String(i), id: i, isPref: false, tdClass: "td-pref-no"});
            prefs.push({name: prefTbl[i].name, id: i, isPref: true, domId: "td-name-" + i, tdClass: "td-pref"});
            prefs.push({name: "", id: i, isPref: false, domId: "td-result-" + i, tdClass: "td-result"});
        }

        for (i = 1, j = prefs.length; i < j; i += chunk) {
            data.push( prefs.slice(i, i + chunk));
        }

        rows = table.selectAll("tr")
            .data(data)
            .enter()
            .append("tr");

        rows.selectAll("td")
            .data( function(row) {
                return columns.map( function(column) {
                    var dd = row[column];

                    if (dd) {
                        return {isPref: dd.isPref, column: column, value: dd.name, id: dd.id, domId: dd.domId, tdClass: dd.tdClass};
                    }

                    return {isPref: false, column: column, value: "", tdClass: ""};
                });
            })
            .enter()
            .append("td")
                .attr("id", function (d) { return d.domId; })
                .attr("class", function (d) { return d.tdClass; })
                .html(function (d) {
                    if (d.isPref) {
                        return ["<a href=\"http://ja.wikipedia.org/wiki/", d.value, "\" target=\"_blank\">", d.value, "</a>"].join("");
                    }

                    return d.value;
                })
                .on("mouseover", function (d) {
                    if (d.isPref) {
                        eventMouseOver(d.id);
                    }
                })
                .on("mouseout", function(d) {
                    if (d.isPref) {
                        eventMouseOut(d.id);
                    }
                });

        return table;
    }


    function JapanQuiz (container) {
        var quiz = this;

        this.d3 = {};

        this.d3.container = d3.select( container );

        this.d3.panel = this.d3.container.append("div")
            .attr("id", "panel")
            .attr("class", "panel");

        this.d3.mode = this.d3.panel.append("select")
            .attr("id", "mode")
            .on("change", function () {
                quiz.start();
            });

        /*jslint unparam: true*/
        this.d3.mode
            .selectAll("option")
            .data(MODE)
            .enter()
            .append("option")
            .attr("value", function (d, i) { return i; } )
            .attr("selected", function (d) { if (d.selected) { return "selected"; } })
            .text(function (d) {
                return d.label;
            });
        /*jslint unparam: false*/

        this.d3.region = this.d3.panel.append("select")
            .attr("id", "region")
            .on("change", function () {
                quiz.start();
            });

        /*jslint unparam: true*/
        this.d3.region
            .selectAll("option")
            .data(REGIONS)
            .enter()
            .append("option")
            .attr("value", function (d, i) { return i; } )
            .attr("selected", function (d) { if (d.selected) { return "selected"; } })
            .text(function (d) {
                return d.label;
            });
        /*jslint unparam: false*/

        this.d3.curPos = this.d3.panel.append("span")
            .attr("id", "cur_pos")
            .attr("class", "cur_pos");

        this.d3.map = this.d3.container.append("div")
            .attr("id", "map")
            .style("width", DEF_W + "px")
            .style("height", DEF_H + "px")
            .style("outline", "2px solid")
            .style("position", "relative");

        this.map = new Datamap( {
            element: this.d3.map[0][0],
            scope: "japan",
            width: DEF_W,
            height: DEF_H,
            geographyConfig: {
                borderColor: "#000",
                popupOnHover: false
            },
            setProjection: function () {
                var projection, path;

                projection = d3.geo.mercator()
                    .center( [ 137, 38.5 ] )
                    .translate( [ DEF_W / 2, DEF_H / 2 ] )
                    .scale( DEF_W * 3 );

                path = d3.geo.path()
                    .projection( projection );

                return { path: path, projection: projection };

            },
            done: function (datamap) {
                datamap.svg.selectAll(".datamaps-subunit").each(function (geo) {
                    if (!(geo.geometry && geo.properties.iso_3166_2)) {
                        return;
                    }

                    geo.id = parseInt(geo.properties.iso_3166_2.slice(3), 10);

                    d3.select(this)
                        .attr("id", geo.properties.iso_3166_2)
                        .style("fill", myfills[ prefFillIndex[geo.id]]);

                    if (geo.id === 47) {  // Okinawa
                        d3.select(this).attr("transform", "translate( 650, -270 )");

                        datamap.svg.append("polyline")
                            .attr("points", "600, 800,   600, 700,   700, 600,   800, 600")
                            .attr("fill", "none")
                            .attr("stroke", "#888")
                            .attr("stroke-width", 4);
                    }

                    prefCenter[geo.id] = datamap.path.centroid(geo);

                    prefGeos[geo.id] = {};
                    prefGeos[geo.id].geo = this;
                });

                datamap.svg.selectAll(".datamaps-subunit").on("click", function (geo) { clickGeography(geo, quiz); });
            }
        });

        addQuestionPlugin(this.map, this);
        addFlagPlugin(this.map, this);
        addBaseBallPlugin(this.map, this);

        this.d3.tablediv = this.d3.container.append("div");
        this.d3.table = createPrefTable(this.d3.tablediv);
    }


    JapanQuiz.prototype.nextQuestion = function () {
        this.curPos++;

        if (this.curPos > this.prefsNum) {
            return;
        }

        if (this.curPos === this.prefsNum) {
            if (this.prefsNum === 0) {
                this.d3.q.text("");
            } else {
                this.d3.q.text("試合終了");
            }

            return;
        }

        this.bso.s = 0;
        this.bso.b = 0;
        this.setBSO();

        this.d3.curPos.text(["[", this.curPos + 1, "/", this.prefsNum, "]  "].join(""));

        this.d3.q.text([this.getName(), " はどこ？"].join(""));
    };


    JapanQuiz.prototype.setBSO = function () {
        var i, color;

        for (i = 0; i < 3; i++) {
            if (i < this.bso.b) {
                color = COLOR_BSO_B;
            } else {
                color = COLOR_OFF;
            }

            this.d3["ball-" + i]
                .style("fill", color);
        }

        for (i = 0; i < 2; i++) {
            if (i < this.bso.s) {
                color = COLOR_BSO_S;
            } else {
                color = COLOR_OFF;
            }

            this.d3["strike-" + i]
                .style("fill", color);
        }

        for (i = 0; i < 2; i++) {
            if (i < this.bso.o) {
                color = COLOR_BSO_O;
            } else {
                color = COLOR_OFF;
            }

            this.d3["out-" + i]
                .style("fill", color);
        }
    };


    JapanQuiz.prototype.getName = function (id) {
        var name;

        if (!id) {
            id = this.qIDs[this.curPos];
        }

        if (this.mode === MODE_PREF) {
            name = prefTbl[id].name;
        } else {
            name = prefTbl[id].capital;
        }

        return name;
    };


    JapanQuiz.prototype.start = function () {
        var mode, region, i, ids = [], rng;

        mode = DEFAULT_MODE;

        try {
            mode = parseInt(d3.select("#mode").node().value, 10);
        } catch (e) {
        }

        if (mode === undefined || mode < 0 || mode >= MODE.length) {
            mode = DEFAULT_MODE;
        }

        this.mode = mode;

        region = DEFAULT_REGION;

        try {
            region = parseInt(d3.select("#region").node().value, 10);
        } catch (e) {
        }

        if (region === undefined || region < 0 || region >= REGIONS.length) {
            region = DEFAULT_REGION;
        }

        this.prevClickPrefID = "";
        this.d3.msg.text("");

        rng = REGIONS[region].idRange;

        for (i = rng[0]; i <= rng[1]; i++) {
            ids.push(i);
        }

        this.qIDs = shuffle(ids);
        this.prefsNum = this.qIDs.length;

        this.d3.maru.attr("visibility", "visible");
        this.d3.batsu.attr("visibility", "hidden");

        this.bso = { b: 0, s: 0, o: 0 };
        this.setBSO();

        this.curPos = -1;
        this.nextQuestion();

        d3.selectAll(".td-result").text("");
    };


    function japanquiz(container)
    {
        return new JapanQuiz(container);
    }


    init();

    window.japanquiz = japanquiz;
}());
