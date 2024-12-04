<script setup>
import NavBar from "./layouts/navbar.vue";
import SideBar from "./layouts/sidebar.vue";
import Content from "./layouts/content.vue";
import { useAuth } from "../../service/useAuth";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";
import { ref, defineProps, onMounted, provide, inject } from "vue";
import WordpressService from "@/service/WordpressService";
import FlashMessage from "@/components/common/FlashMessage.vue";
import { EventBus } from "@/EventBus";
import { useStore } from "@/stores/store";

const store = useStore();

const router = useRouter();
const { logout } = useAuth();
const isSidebarToggled = ref(false);
const navBarToggle = (value) => {
  isSidebarToggled.value = value;
};

const loading = ref(true);
const error = ref(false);
const errors = ref([]);
const dashboardData = ref([]);
const userData = ref([]);

const fetchDashboardData = async () => {
  try {
    const response = await WordpressService.fetchDashboardData();
    if (response.status === 200 && response.data.success) {
      loading.value = false;
      dashboardData.value = response.data;
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error("Authentication failed. Please log in.", error);
      error.value = true;
      loading.value = false;
      localStorage.removeItem("access_token");
      router.push("/login");
    } else {
      console.error("An error occurred:", error.message);
    }
  }
};

const resendLink = async () => {
  try {
    const response = await WordpressService.resendLink();
    Swal.fire(response.data.message);
  } catch (error) {
    console.log(error);
    console.error("Error Occur while resend link", error);
  }
};

const loadingOnOff = async (value) => {
  loading.value = value;
};
onMounted(async () => {
  await fetchDashboardData();
  EventBus.on("fetchDashboardData", fetchDashboardData);
  EventBus.on("loadingOnOff", loadingOnOff);
});

const regenerateWebsite = async () => {
  try {
    loading.value = true;
    const response = await WordpressService.regenerateWebsite({
      agency_id: dashboardData.value.user.agency_id,
      website_url: dashboardData.value.agency_website_info[0].website_domain,
    });
    await fetchDashboardData();
  } catch (error) {
    console.log(error);
    console.error("Error Occur while regenerating website", error);
  }
  EventBus.emit("reloadIframe");
  loading.value = false;
};

provide("dashBoardMethods", {
  regenerateWebsite,
  fetchDashboardData,
});
</script>

<template>
  <div class="page">
    <FlashMessage :visible="store.flashMeassge" v-if="store.flashMeassge" />
    <NavBar
      @logout="logout"
      @nav-bar-toggle="navBarToggle"
      :dashboardData="dashboardData?.user"
    ></NavBar>
    <SideBar
      :dashboardData="dashboardData"
      :toggled="isSidebarToggled"
    ></SideBar>

    <Content
      :dashboardData="dashboardData"
      :loading="loading"
      :resendLink="resendLink"
    ></Content>
  </div>
</template>
