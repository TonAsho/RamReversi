//変数たち

//先手後手
//true => 先手
//false => 後手
let turn = true;
//自分の色
let meColor = "b";
//手数
let count = 4;
//さいごに置いた駒
let lastPut = 0;
//棋譜記録
let kihu = [];
//打てる場所に記しつけたとこ
let canPutPlaces = [];
//中心の関数たち


//マスをクリックしたとき
function yech(id) {
    //手番かどうか
    if(!turn) {
        alert("相手の手番です！");
        return;
    }
    if(piece[id - 1] == 0) {
        //こまをおく
        if(turnKoma(id)) {
            if(meColor == "b") {
                piece[id - 1] = 1;
            } else {
                piece[id - 1] = 2;
            }
            putKoma(id);
            lastPut = id;
            count++;
            kihu.push(Number(id));
            turn = false;
            putOkReturn();
            if(bod) {
                bodPut();
            } else {
                socket.emit("putKoma", {
                    id: aiteId,
                    place: id
                });
            }
            if(count == 64) {
                winner();
                return;
            }
        } else {
            alert("置けないぜーーー")
        }

    } else {
        return;
    }

}

//駒をひっくり返す
function turnKoma(ids) {
    //下
    let id = Number(ids);
    let turns = [];
    //下
    turns.push(returnKoma(id+8, 64, 8 ,8 , id));
    //上
    turns.push(mReturnKoma(id-8, 0, 8, 8, id));
    //左右
    turns.push(returnKoma(id+1, idCheck(id)[0]*8, 1, 1, id));
    turns.push(mReturnKoma(id-1, (idCheck(id)[0] - 1) * 8 + 1, 1, 1, id));
    //ななめ
    turns.push(naname1(id-7,1,7,7,id,up,right));
    turns.push(naname1(id-9,1,9,9,id,up,left));
    turns.push(naname2(id+7,64,7,7,id,bottom,left));
    turns.push(naname2(id+9,64,9,9,id,bottom,right));
    let put = false;
    for (let f = 0; f < 8; f++) {
        if(turns[f].length != 0) {
            put = true;
        }
    } 
    if(put) {
        for (let f = 0; f < 8; f++) {
            for (let z = 0; z < turns[f].length; z++) {
                if(meColor == "b") {
                    piece[turns[f][z] - 1] = 1;
                } else {
                    piece[turns[f][z] - 1] = 2;
                }
                putKoma2(turns[f][z]);
            }
        }
        return true;
    } else {
        return false;
    }

}
function turnCheck(ids) {
        let id = Number(ids);
        let turns = [];
        turns.push(returnKoma(id+8, 64, 8 ,8 , id));
        turns.push(mReturnKoma(id-8, 0, 8, 8, id));
        turns.push(returnKoma(id+1, idCheck(id)[0]*8, 1, 1, id));
        turns.push(mReturnKoma(id-1, (idCheck(id)[0] - 1) * 8 + 1, 1, 1, id));
        turns.push(naname1(id-7,1,7,7,id,up,right));
        turns.push(naname1(id-9,1,9,9,id,up,left));
        turns.push(naname2(id+7,64,7,7,id,bottom,left));
        turns.push(naname2(id+9,64,9,9,id,bottom,right));
        let put = false;
        for (let f = 0; f < 8; f++) {
            if(turns[f].length != 0) {
                put = true;
            }
        } 
        if(put) {
            return true;
        } else {
            return false;
        }
}
//相手の打った場所を取得
socket.on("komaPut", (place) => {
    let p = place;
    if(meColor == "b") {
        piece[p - 1] = 2;
        meColor = "w";
    } else {
        piece[p - 1] = 1;
        meColor = "b";
    }
    count++;
    turnKoma(p);
    putKoma(p);
    if(meColor == "b") {
        meColor = "w";
    } else {
        meColor = "b";
    }
    kihu.push(p)
    changeStyle(p);
    lastPut = p;
    if(count == 64) {
        winner();
        return;
    }
    let pp = looking();
    canPutPlaces = pp;
    if(canPutPlaces.length == 0){
        alert("置ける場所がないようです！パスします。");
        pass();
        return;
    } else {
        putOk(pp);
    }
    turn = true;
})
//ぼっとよう
function bodPut() {
    let ppp = looking();
    canPutPlaces = ppp;
    if(canPutPlaces.length == 0){
        alert("ボット：置ける場所がないようです！パスします。");
        turn = true;
        let p2 = looking();
        canPutPlaces = p2;
        if(canPutPlaces.length == 0){
            alert("試合終了！");
            winner();
        } else {
            putOk(p2);
        }
        return;
    } 
    let rnd = Math.floor(Math.random() * canPutPlaces.length);
    let p = canPutPlaces[rnd];
    if(meColor == "b") {
        piece[p - 1] = 2;
        meColor = "w";
    } else {
        piece[p - 1] = 1;
        meColor = "b";
    }
    count++;
    turnKoma(p);
    putKoma(p);
    if(meColor == "b") {
        meColor = "w";
    } else {
        meColor = "b";
    }
    kihu.push(p)
    changeStyle(p);
    lastPut = p;
    if(count == 64) {
        winner();
        return;
    }
    putOkReturn();

    let pp = looking();
    canPutPlaces = pp;
    if(canPutPlaces.length == 0){
        alert("置ける場所がないようです！パスします。");
        bodPut();
        return;
    } else {
        putOk(pp);
    }
    turn = true;
}
//パスする
function pass() {
    socket.emit("pass", (aiteId));
}
//パスを受け取る
socket.on("passed", () => {
    alert("相手がパスしました。");
    let pp = looking();
    canPutPlaces = pp;
    if(canPutPlaces.length = 0){
        alert("試合終了！");
        winner();
    } else {
        putOk(pp);
        turn = true;
    }
})
//置けるとこみる
function looking() {
    let canPut = [];
    for (let f = 0; f < 64; f++) {
        if(piece[f] == 0) {
            if(turnCheck(f + 1)) {
                canPut.push(f + 1);
            }
        }
    }
    return canPut;
}
//関数の中に出てくる関数たち
//判定関数
function returnKoma(a, b, c, d, id) {
    let turns = [];
    let isturns = false;
    for(let f = a; f <= b; f+=c) {
        if(piece[id + d - 1] == 0 || !(aiteKoma(id+d))) {
            break;
        }
        if(aiteKoma(f)) {
            turns.push(f);
        } else if(isClear(f)) {
            turns.length = 0;
            break;
        } else {
            isturns = true;
            break;
        }
    }
    if(isturns == true) {
        return turns;
    } else {
        return [];
    }
    
}
function mReturnKoma(a, b, c, d, id) {
    let turns = [];
    let isturns = false;
    for(let f = a; f >= b; f-=c) {
        if(piece[id - d - 1] == 0 || !(aiteKoma(id-d))) {
            break;
        }
        if(aiteKoma(f)) {
            turns.push(f);
        } else if(isClear(f)) {
            turns.length = 0;
            break;
        } else {
            isturns = true;
            break;
        }
    }
    if(isturns == true) {
        return turns;
    } else {
        return [];
    }
    
}
function naname1(a, b, c, d, id,x,y) {
    let turns = [];
    let isturns = false;
    for (let z = 0; z < 8; z++) {
        if(x[z] == id || y[z] == id) {
            return [];
        }
    }
    for(let f = a; f >= b; f-=c) {
        if(piece[id - d - 1] == 0 || !(aiteKoma(id-d))) {
            break;
        }
        if(aiteKoma(f)) {
            turns.push(f);
            for (let z = 0; z < 8; z++) {
                if(x[z] == f || y[z] == f) {
                    return [];
                }
            }
        } else if(isClear(f)) {
            turns.length = 0;
            break;
        } else {
            isturns = true;
            break;
        }
        for (let z = 0; z < 8; z++) {
            if(x[z] == f || y[z] == f) {
                break;
            }
        }
    }
    if(isturns == true) {
        return turns;
    } else {
        return [];
    }
    
}
function naname2(a, b, c, d, id,x,y) {
    let turns = [];
    let isturns = false;
    for (let z = 0; z < 8; z++) {
        if(x[z] == id || y[z] == id) {
            return [];
        }
    }
    for(let f = a; f <= b; f+=c) {
        if(piece[id + d - 1] == 0 || !(aiteKoma(id+d))) {
            break;
        }
        if(aiteKoma(f)) {
            turns.push(f);
            for (let z = 0; z < 8; z++) {
                if(x[z] == f || y[z] == f) {
                    return [];
                }
            }
        } else if(isClear(f)) {
            turns.length = 0;
            break;
        } else {
            isturns = true;
            break;
        }
        for (let z = 0; z < 8; z++) {
            if(x[z] == f || y[z] == f) {
                break;
            }
        }
    }
    if(isturns == true) {
        return turns;
    } else {
        return [];
    }
    
}
//相手の駒かどうか
function aiteKoma(id) {
    if(meColor == "b" && piece[id - 1] == 2) {
        return true;
    }
    if(meColor == "w" && piece[id - 1] == 1) {
        return true;
    }
    return false;
}
//何もないかどうか
function isClear(id) {
    if(piece[id - 1] == 0) {
        return true;
    }
    return false;
}

//駒の配置状況
//黒が１
//白が2
let piece = []

//勝敗判定
function winner() {
    let black = 0;
    let white = 0;
    for (let f = 0; f < 64; f++) {
        if(piece[f] == 1) {
            black++;
        } else if(piece[f] == 2) {
            white++;
        }
    }
    if(meColor == "b") {
        if(black > white ){
            alert("あなたの勝ち！");
        } else if(white > black) {
            alert("あなたの負け！")
        } else {
            alert("引き分け！")
        }
    } else {
        if(black < white ){
            alert("あなたの勝ち！");
        } else if(white < black) {
            alert("あなたの負け！")
        } else {
            alert("引き分け！")
        }
    }
    reset();
    document.getElementById("main").style.display = "block";
    document.getElementById("border").style.display = "none";
}

//クリックされた駒の場所を返す
function idCheck(id) {
    let height = 0;
    let width = 0;
    if(id % 8 == 0) {
        height = Math.floor(id / 8);
        width = 8;
    } else {
        height = Math.floor(id / 8 + 1);
        width = id % 8 + 1;
    }
    return [height, width];
}
//駒をおく
function putKoma(id) {
    if(piece[id - 1] == 1) {
        //黒
        let add = document.createElement('div');
        document.getElementById(id).innerHTML = "";
        add.className = "komaBlack";
        document.getElementById(id).append(add);
        changeStyle(id);
        
    } else if(piece[id - 1] == 2) {
        //白
        let add = document.createElement('div');
        document.getElementById(id).innerHTML = "";
        add.className = "komaWhite";
        document.getElementById(id).append(add);
        changeStyle(id);
    }
}
function putKoma2(id) {
    if(piece[id - 1] == 1) {
        //黒
        let add = document.createElement('div');
        document.getElementById(id).innerHTML = "";
        add.className = "komaBlack";
        document.getElementById(id).append(add);
        
    } else if(piece[id - 1] == 2) {
        //白
        let add = document.createElement('div');
        document.getElementById(id).innerHTML = "";
        add.className = "komaWhite";
        document.getElementById(id).append(add);
    }
}
//駒をおいた時のいろ
function changeStyle(id) {
    if(lastPut == 0) {
        document.getElementById(id).style.backgroundColor = "green";
        return;
    } else {
        document.getElementById(lastPut).style.backgroundColor = "lightgreen";
        document.getElementById(id).style.backgroundColor = "green";
    }
}
//盤を絵画する
function showBoard() {
    for (let f = 0; f < 64; f++) {
        if(piece[f] == 1) {
            //黒
            let add = document.createElement('div');
            document.getElementById(f + 1).innerHTML = "";
            add.className = "komaBlack";
            document.getElementById(f + 1).append(add);
        } else if(piece[f] == 2) {
            //白
            let add = document.createElement('div');
            document.getElementById(f + 1).innerHTML = "";
            add.className = "komaWhite";
            document.getElementById(f + 1).append(add);
        }
        
    }
}
let up = [1,2,3,4,5,6,7,8];
let right = [8,16,24,32,40,48,56,64];
let left = [1,9,17,25,33,41,49,57];
let bottom = [57,58,59,60,61,62,63,64];
//置ける場所の色を変える
function putOk(oks) {
    for (let f = 0; f < oks.length; f++) {
        let number = Number(oks[f]);
        let add = document.createElement("div");
        add.className = "canPut";
        document.getElementById(number).append(add);
    }
}
function putOkReturn() {
    if(canPutPlaces.length == 0) {
        return;
    }
    let x = canPutPlaces;
    for( let i = 0 ; i < x.length ; i ++ ) {
        if(x[i] != lastPut) {
            document.getElementById(x[i]).innerHTML = "";
        }
    }
    canPutPlaces.length = 0;
}
//対局情報をリセット
function reset() {
    turn = true;
    meColor = "b";
    count = 4;
    lastPut = 0;
    kihu.length = 0;
    canPutPlaces.length = 0;
}
function gameStart() {
    for (let f = 1; f <= 64; f++) {
        if(f == 28 || f == 37) {
            piece[f - 1] = 2;
        } else if(f == 29 || f == 36) {
            piece[f - 1] = 1;
        } else {
            piece[f - 1] = 0;
        }
    }
    showBoard();
    if(turn) {
        let p = looking();
        canPutPlaces = p;
        putOk(p);
    }
}