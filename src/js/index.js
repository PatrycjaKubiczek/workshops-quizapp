import io from 'socket.io-client';
import config from './config';
import Vue from "vue/dist/vue.js";

window.onload = () => {
    document.querySelector('#app').classList.remove('loading');
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
        }
    },

    filters : {},

    created : function(){

        this.socket.on("joined",function(res) {
            app.user = res.user;
            app.user.position = false;
            app.user.points = 0;

            // config.questionTime = res.answerTime;
            // config.leaderboardTime = res.leaderboardTime;
        });

        this.socket.on("question",function(res) {
            app.question.data = res; 

            app.toaster.data.length = 0;

            app.question.state.right = false;
            app.result.state.active = false;
        });

        this.socket.on("questionResult",function(res) {
            app.result.state.active = true;
            app.result.data.correct = res.correct;
            app.result.data.points = res.points;

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

        });

    },

    mounted : function() {
        this.timer.interval = setInterval(() =>{
            if(app.timer.value > 0){
                app.timer.value--;

            }
        }, 1000)
    },
});

app.$mount('#app');
