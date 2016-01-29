<template>
    <h2 class="content-head is-center">Welco</h2>

    <div class="pure-g">
        <div class="l-box-lrg pure-u-1 pure-u-md-1-5">
        </div>
        <div class="l-box-lrg pure-u-1 pure-u-md-3-5">
            <form class="pure-form pure-form-stacked">
                <fieldset>
                    <p v-if="emailNotVerified" class="error-message">
                        メールアドレス確認のメールを送信しました。<br/>メールに記載されたURLをクリックして登録を完了してください。
                    </p>

                    <label for="name">ユーザー名</label>
                    <input id="name" type="text" placeholder="ユーザー名" v-model="username">


                    <label for="password">パスワード</label>
                    <input id="password" type="password" placeholder="パスワード" v-model="password">

                    <!-- qiita(.prevent) -->
                    <button class="primary-button pure-button" @click.prevent="logIn">ログイン</button>
                </fieldset>
                <fieldset>
                    <button class="secondary-button pure-button" v-link="'/signup'">アカウントがない場合はこちらから新規登録</button>
                </fieldset>
            </form>
        </div>

    </div>


</template>

<style src="../css/layouts/marketing.css"></style>

<script>
"use strict";

import Parse from 'parse'

export default {
    data: {
        username: '',
        password: ''
    },
    computed: {
        emailNotVerified: function() {
            return Parse.User.current() && !Parse.User.current().get('emailVerified')
        }
    },
    methods: {
        logIn: function() {
            const _this = this      // thenの中で使うために退避
            Parse.User.logIn(this.username, this.password)
            .then(function(user) {
                console.log('log in succeed.')
                _this.$route.router.go('/visitorinfo')
            },
            function(error) {
                console.error(error)
            });
        }
    }
}
</script>
