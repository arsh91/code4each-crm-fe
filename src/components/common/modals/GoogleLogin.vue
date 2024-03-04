<template>
 <GoogleLogin :callback="googleSignUp" prompt auto-login />
</template>
<script setup>
import WordpressService from "@/service/WordpressService";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();

const googleSignUp = async (response) => {
  try {
    const apiResponse = await WordpressService.GoogleLogin.googleSignUp({
      id_token: response.credential,
    });
    if (apiResponse.status === 200 && apiResponse.data.success) {
      const token = apiResponse.data.access_token;
      localStorage.setItem("access_token", token);
      router.push("/dashboard");
    }
  } catch (error) {
    console.error(error);
  }
};
</script>


