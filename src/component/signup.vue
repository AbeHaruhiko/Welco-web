<template>
    <h2 class="content-head is-center">Welco</h2>

    <div class="pure-g">
        <div class="l-box-lrg pure-u-1 pure-u-md-1-5">
        </div>
        <div class="l-box-lrg pure-u-1 pure-u-md-3-5">
            <validator name="validation">
                <form class="pure-form pure-form-stacked" novalidate>
                    <fieldset>

                        <label for="name">ユーザー名</label>
                        <input id="name" type="text" placeholder="ユーザー名" v-model="username" v-validate:username="['required']">
                        <p v-if="$validation.username.required" class="error-message">ユーザー名は必須です</p>

                        <label for="email">メールアドレス</label>
                        <input id="email" type="email" placeholder="メールアドレス" v-model="email" v-validate:email="['required', 'email', 's2mail']">
                        <p v-if="$validation.email.invalid" class="error-message">不正なメールアドレスです</p>


                        <label for="password">パスワード</label>
                        <input id="password" type="password" placeholder="パスワード" v-model="password" v-validate:password="['required']">
                        <p v-if="$validation.password.required" class="error-message">パスワードは必須です</p>

                        <!-- <p v-if="$validation.invalid" class="error-message">入力内容にエラーがあります！</p> -->
                        <button class="primary-button pure-button" @click.prevent="signUp">ユーザー登録</button>
                    </fieldset>
                    <fieldset>
                        <button class="secondary-button pure-button" v-link="'/login'">アカウントをお持ちの場合はここからログイン</button>
                    </fieldset>
                </form>
            </validator>
        </div>

    </div>


</template>

<style src="../css/layouts/marketing.css"></style>
<style>
.error-message {
    color: #a94442;
    background-color: #f2dede;
    border: solid 1px #ebccd1;
    padding: 8px;
    border-radius: 4px;
}
</style>

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
    },
    validators: {
        email: function(val) {
            return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(val)
        },
        s2mail: function(val) {
            return /.+@s2soft.co.jp$/.test(val)
        }
    }
}
</script>
