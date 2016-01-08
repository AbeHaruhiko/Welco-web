<template>
    <h2 class="content-head is-center">Welco</h2>

    <div class="pure-g">
        <div class="l-box-lrg pure-u-1 pure-u-md-1-5">
        </div>
        <div class="l-box-lrg pure-u-1 pure-u-md-3-5">
            <form class="pure-form pure-form-stacked">
                <fieldset>

                    <label for="name">ユーザー名</label>
                    <input id="name" type="text" placeholder="ユーザー名">

                    <label for="email">メールアドレス</label>
                    <input id="email" type="email" placeholder="メールアドレス">


                    <label for="password">パスワード</label>
                    <input id="password" type="password" placeholder="パスワード">

                    <button class="primary-button pure-button">ユーザー登録</button>
                </fieldset>
                <fieldset>
                    <button class="secondary-button pure-button" v-link="'/login'">アカウントをお持ちの場合はここからログイン</button>
                </fieldset>
            </form>
        </div>

    </div>


</template>

<style src="../css/layouts/marketing.css"></style>
