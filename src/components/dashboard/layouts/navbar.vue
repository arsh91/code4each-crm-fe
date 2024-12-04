<script setup>
import { defineEmits, ref, defineProps, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "@/stores/store";

const router = useRouter();

const emits = defineEmits();
const isSidebarToggled = ref(true);
const showUserMenu = ref(false);
const store = useStore();

const toggleSidebar = () => {
  store.updateShrink();
};

const logout = () => {
  emits("logout");
};

const navigate = () => {
  router.push("/");
};
const props = defineProps({
  dashboardData: Object,
});
</script>
<template>
  <header class="header">
    <nav class="navbar navbar-expand-lg px-4 py-2 bg-white shadow">
      <a
        class="sidebar-toggler text-gray-500 me-4 me-lg-5 lead sidetoggle-s"
        @click="toggleSidebar"
      >
        <i class="fa fa-align-left"></i>
      </a>
      <a
        class="navbar-brand fw-bold text-uppercase text-base"
        @click="navigate"
      >
        <span class="d-none d-brand-partial">Bubbly </span>
        <span class="d-none d-sm-inline">
          <img src="/images/logo-beta.png" />
        </span>
      </a>
      <ul class="ms-auto d-flex align-items-center list-unstyled mb-0">
        <li class="nav-item  ">
              <div class="panel-header-title1">
                
                <!-- <button type="submit" class="preview-btn"><i class="fa fa-eye" aria-hidden="true"></i> preview</button> -->
              </div>
            </li>
        <li class="nav-item dropdown">
          <div
            class="dropdown-menu dropdown-menu-animated text-sm"
            id="searchDropdownMenu"
          >
            <h6 class="dropdown-header text-uppercase fw-normal">
              Recent pages
            </h6>
            <a class="dropdown-item py-1" href="cms-post.html">
              <i class="far fa-file me-2"></i>Posts
            </a>
            <a class="dropdown-item py-1" href="widgets-stats.html">
              <i class="far fa-file me-2"></i>Widgets
            </a>
            <a class="dropdown-item py-1" href="pages-profile.html">
              <i class="fa fa-file me-2"></i>Profile
            </a>
            <div class="dropdown-divider"></div>
            <h6 class="dropdown-header text-uppercase fw-normal">Users</h6>
            <a class="dropdown-item py-1" href="pages-profile.html">
              <img
                class="avatar avatar-xs p-1 me-2"
                src="https://d19m59y37dris4.cloudfront.net/bubbly/1-2/img/avatar-0.jpg"
                alt="Jason Doe"
              />
              <span>Jason Doe</span>
            </a>
            <a class="dropdown-item py-1" href="pages-profile.html">
              <img
                class="avatar avatar-xs p-1 me-2"
                src="https://d19m59y37dris4.cloudfront.net/bubbly/1-2/img/avatar-1.jpg"
                alt="Frank Williams"
              />
              <span>Frank Williams</span>
            </a>
            <a class="dropdown-item py-1" href="pages-profile.html">
              <img
                class="avatar avatar-xs p-1 me-2"
                src="https://d19m59y37dris4.cloudfront.net/bubbly/1-2/img/avatar-2.jpg"
                alt="Ashley Wood"
              />
              <span>Ashley Wood</span>
            </a>
            <div class="dropdown-divider"></div>
            <h6 class="dropdown-header text-uppercase fw-normal">Filters</h6>
            <a class="dropdown-item py-1" href="#!">
              <span class="badge me-2 badge-success-light">Posts</span>
              <span class="text-xs">Search all posts</span>
            </a>
            <a class="dropdown-item py-1" href="#!">
              <span class="badge me-2 badge-danger-light">Users</span>
              <span class="text-xs">Only in users</span>
            </a>
            <a class="dropdown-item py-1" href="#!">
              <span class="badge me-2 badge-warning-light">Campaigns</span>
              <span class="text-xs">Only in campaigns</span>
            </a>
          </div>
        </li>
        <li class="nav-item dropdown ms-auto">
          <a
            class="nav-link pe-0"
            id="userInfo"
            href="#"
            data-bs-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
            @click="showUserMenu = !showUserMenu"
          >
            <span class="avatar p-1">
              {{ dashboardData?.name.charAt(0).toUpperCase() }}</span
            >
          </a>
          <div
            class="dropdown-menu dropdown-menu-end dropdown-menu-animated"
            aria-labelledby="userInfo"
            :class="{ show: showUserMenu }"
          >
            <div class="dropdown-header text-gray-700">
              <h6 class="text-uppercase font-weight-bold">
                {{ dashboardData?.name }}
              </h6>
              <small>{{ dashboardData?.agency.name }}</small>
            </div>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item" @click="logout">Logout</a>
          </div>
        </li>
      </ul>
    </nav>
  </header>
</template>
<style scoped>
.sidetoggle-s {
  cursor: pointer;
}
</style>
