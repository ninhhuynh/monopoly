<template>
  <div>
    <form @submit="onSubmitForm">
      <label for="input">Your input field:</label><br />
      <input type="text" id="input" name="input" v-model="inputValue" /><br />
      <input type="submit" value="Submit" />
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "App",
  methods: {
    onSubmitForm(e) {
      e.preventDefault();
      console.log(`submitting your form ${this.inputValue}`);
      axios({
        method: "post",
        url: "http://localhost:3000",
        data: JSON.stringify({ value: this.inputValue }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
  },
  data() {
    return {
      inputValue: "",
    };
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
