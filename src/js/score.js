export function score(score){
    if(localStorage.getItem('bestScore')){
        if(localStorage.getItem('bestScore') < score){
            localStorage.setItem('bestScore', score);
        }
    }
    else{
        localStorage.setItem('bestScore', score);
    }
}