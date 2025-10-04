const template = (manipulation, value, reset = false) => {
    let key;
    let values;
    if (manipulation === "transform") {
        key = "transition";
        values = [`transform ${value}s`, `-webkit-transform ${value}s`];
    } else if (manipulation === "transit") {
        key = "transition";
        values = [`background ${value}s`, `background ${value}s`];
    } else if (manipulation === "rotate") {
        key = "transform";
        values = [`rotateY(${value}deg)`, `rotateY(${value}deg)`];
    } else {
        throw "invalid"
    }

    if (reset) {
        values = ["", ""]
    }

    return {
        [key]: values[0],
        [`-webkit-${key}`]: values[1]
    };
}

const flip = (page, index, isLast = false, time = 1.0) => {
    page.removeClass("current");
    page.css(template("transform", time));
    page.css(template("rotate", 0, true));
    // エフェクトの切り替え
    page.children("div.effect.one").removeClass("one").addClass("two");
    page.children("div.effect.two").css(template("transit", time / 2));

    // 右のページ
    if (index % 2 === 0) {
        // クリックしたページとその裏側のページが裏返る
        page.removeClass("flipped");
        page.prev().removeClass("flipped");
        page.next().removeClass("current");
        page.prev().addClass("current");
        page.prev().prev().addClass("current");

        page.prev().css(template("transform", time));
        page.prev().children("div.effect.two").removeClass("two").addClass("one");
        page.prev().children("div.effect.one").css(template("transit", time / 2));
    }
    // 左のページ
    else {
        page.addClass("flipped");
        page.next().addClass("flipped");
        page.prev().removeClass("current");
        page.next().addClass("current");
        page.next().next().addClass("current");

        page.next().css(template("transform", time));
        page.next().children("div.effect.two").removeClass("two").addClass("one");
        page.next().children("div.effect.one").css(template("transit", time / 2));
    }

    n_process += 1;
    setTimeout(function () {
        n_process -= 1;
        if (isLast) {
            if (index % 2 === 0) {
                page.prev().css(template("transform", 1.5));
                page.prev().prev().css(template("transform", 1.5));
            } else {
                page.next().css(template("transform", 1.5));
                page.next().next().css(template("transform", 1.5));
            }
        }
    }, time * 1000);
}

// initialize
const root = $("#pages");  // tips. $(".pages *")とすれば配下全ての子要素を取得できる
const pages = root.children();
const colors = ["FF8888", "FFFF88", "AADDAA", "88FFFF", "8888FF"];
let count = 0;
let n_process = 0;

pages.each(function (i, _) {
    let page = $(this);
    if (i === 0) {
        page.addClass("current");
    }

    if (i % 2 === 0) {
        page.css({"z-index": (pages.length - i)});

        if (page.children().hasClass("bookmark")) {
            let bookmark = page.children("div.bookmark");
            bookmark.css({
                "top": `min(${2.5 + 4 * count}vw, ${2.5 + 4 * count}vh)`,
                "border-right": `solid min(2vw, 2vh) #${colors[count % 5]}`
            });
            count += 1;
        }
    } else {
        if (page.children().hasClass("bookmark")) {
            let bookmark = page.children("div.bookmark");
            bookmark.css({
                "top": `min(${2.5 + 4 * (count - 1)}vw, ${2.5 + 4 * (count - 1)}vh)`,
                "border-left": `solid min(2vw, 2vh) #${colors[(count - 1) % 5]}`
            });
        }
    }
});

$(window).on("load", function () {
    $(".page")
        .click(function () {
                if (n_process === 0 && $(this).hasClass("current")) {
                    let page = $(this);
                    let index = pages.index(page) + 1;
                    flip(page, index);
                }
            })
        .hover(function () {
                if ($(this).hasClass("current")){
                    let page = $(this);
                    let index = pages.index(page) + 1;
                    page.css(template("rotate", (index % 2 === 0) ? 10 : -10));
                }
            },
            function () {
                let page = $(this);
                page.css(template("rotate", 0, true));
            });

    $(".bookmark")
        .click(function (event) {
            if (n_process === 0) {
                // bookmarkはpageの子要素なので、イベントを親要素まで伝搬させない
                event.stopPropagation();
                const bookmark = $(this);
                let src = (root.children("div.page").hasClass("flipped")) ? pages.index((root.children("div.page.flipped").slice(-1)[0])) + 2 : 1;
                let tgt = pages.index(bookmark.parent()) + 1;
                if (tgt % 2 === 0) {
                    src -= 1;
                    tgt -= 2;
                }
                let delay = 0;
                const dir = (src < tgt) ? 2 : -2;
                const idx = (src < tgt) ? 1 : 0;

                while (src !== tgt) {
                    let page = $(root.children()[src - 1]);
                    flip(page, idx, (src + dir) === tgt, 1.5 + delay);
                    delay += 0.25;
                    src += dir;
                }
            }
        })
        .hover(
            function (event) {
                if (!$(this).parent().hasClass("current")) {
                    event.stopPropagation();
                }
            },
            function (event) {}
        );

    $("#book").addClass("bound");
});
