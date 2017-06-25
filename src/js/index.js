import io from 'socket.io-client';
import config from './config';
import Vue from "vue/dist/vue.js";

window.onload = () => {
    document.querySelector('#app').classList.remove('app--loading');
};

let socket = io.connect(config.engine);

let app = new Vue({
    data : {
        socket: socket,
        user: {},
        timer: {
            value: 0,
            max: 10
        },
        toaster: {
            state: {},
            data: []
        },
        question: {
            state: {
                left: false,
                right: true
            },
            data: {}
        },
        leaderboard: {
            state: {
                left: false,
                right: true
            },
            data: {}
        },
        result: {
            state: {
                active: false,
                correct: false,
                points: 0
            },
            date: {}
        }
    },

    methods : {
        sendAnswer : function(id){
            this.socket.emit('answer', {
                'answer' : [id]
            })
        },
        shuffle : function(array){
            for (let i = array.length; i; i--) {
                let j = Math.floor(Math.random() * i);
                [array[i - 1], array[j]] = [array[j], array[i - 1]];
            }
        }
    },

    filters : {
        position : function (value) {
            if (!value) {
                return '-';
            } else if (value % 10 === 1 && value !== 11 ) {
                return value + 'st';
            } else if (value % 10 === 2 ) {
                return value + 'nd';
            } else if ( value % 10 === 3) {
                return value + 'rd';
            } else {
                return value + 'th';
            }
        }
    },

    created : function(){

        this.socket.on("joined",function(res) {
            app.user = res.user;
            app.user.position = false;
            app.user.points = 0;

            config.questionTime = res.answerTime;
            config.leaderboardTime = res.leaderboardTime;
        });

        this.socket.on("question",function(res) {
            app.question.data = res; 

            app.shuffle(app.question.data.answers);


            app.timer.value=config.questionTime/1000;
            app.timer.max=config.questionTime/1000;

            app.toaster.data.length = 0;

            app.question.state.right = false;
            app.result.state.active = false;
        });

        this.socket.on("questionResult",function(res) {
            app.result.state.active = true;
            app.result.state.correct = res.correct;
            app.result.state.points = res.points;

            app.question.state.left = true;

            app.user.points += res.points;
        });

        this.socket.on("questionFinish",function() {
            app.question.state.left = true;

            app.result.state.active = false;

            setTimeout(() => {
                app.question.state.left = false;
                app.question.state.right = true;
                app.question.state.result = false;
            },1000);

        });

        this.socket.on("leaderboard",function(res) {
            app.result.state.active = false;

            app.leaderboard.state.right = false;

            app.leaderboard.data = res;

            for(let i =0; i < app.leaderboard.data.leaderboard.length; i++){
                if(app.leaderboard.data.leaderboard[i].id === app.user.id){
                    app.user.position = app.leaderboard.data.leaderboard[i].position
                }
            }

            app.timer.value=config.leaderboardTime/1000;
            app.timer.max=config.leaderboardTime/1000;

        });

        this.socket.on("leaderboardFinish",function() {
            app.leaderboard.state.left = true;

            setTimeout(() => {
                app.leaderboard.state.left = false;
                app.leaderboard.state.right = true;
            },1000);
        });

        this.socket.on("gameFinish",function(res) {

        });

        this.socket.on("message",function(res) {

            app.toaster.data.push(res);


        });

    },

    mounted : function() {
        this.timer.interval = setInterval(() => {
            if (app.timer.value>0){
                app.timer.value--;
            }
        },1000);
    },
});

app.$mount('#app');
