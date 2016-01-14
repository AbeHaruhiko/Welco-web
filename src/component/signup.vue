<template>
    <h2 class="content-head is-center">Welco</h2>

    <div class="pure-g">
        <div class="l-box-lrg pure-u-1 pure-u-md-1-5">
        </div>
        <div class="l-box-lrg pure-u-1 pure-u-md-3-5">
            <form class="pure-form pure-form-stacked">
                <fieldset>

                    <label for="name">ユーザー名</label>
                    <input id="name" type="text" placeholder="ユーザー名" v-model="username">

                    <label for="email">メールアドレス</label>
                    <input id="email" type="email" placeholder="メールアドレス" v-model="email">


                    <label for="password">パスワード</label>
                    <input id="password" type="password" placeholder="パスワード" v-model="password">

                    <button class="primary-button pure-button" @click.prevent="signUp">ユーザー登録</button>
                </fieldset>
                <fieldset>
                    <button class="secondary-button pure-button" v-link="'/login'">アカウントをお持ちの場合はここからログイン</button>
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
        email: '',
        password: ''
    },
    methods: {
        signUp: function() {
            const _this = this
            var user = new Parse.User();
            user.set('username', this.username);
            user.set('email', this.email);
            user.set('password', this.password);

            user.signUp(null, null)
            .then(function(user) {
                console.log('sign up succeed.')
                _this.$route.router.go('/visitorinfo')
            },
            function(error) {
                console.error(error)
            });
        }
    }
}
</script>
