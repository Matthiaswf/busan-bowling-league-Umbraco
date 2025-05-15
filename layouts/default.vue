<template>
  <div class="flex flex-col min-h-screen">
    <header class="site-header bg-white shadow py-4 sm:py-6">
      <div
        class="max-w-screen-lg mx-auto px-4 sm:px-6 flex items-center justify-center gap-3"
      >
        <NuxtLink to="/" class="flex items-center gap-2 sm:gap-3">
          <img
            src="/assets/navbar/beer.svg"
            alt="Logo"
            class="w-10 h-10 sm:w-14 sm:h-14"
          />
          <h1
            class="text-2xl sm:text-4xl font-extrabold bg-gradient-logo bg-clip-text text-transparent"
          >
            Busan Bowling League
          </h1>
        </NuxtLink>
      </div>
    </header>

    <div
      class="nav-links-bar mt-3 flex justify-center gap-6 text-sm font-medium text-gray-700"
    >
      <NuxtLink to="/standings" class="nav-link">Standings</NuxtLink>
      <NuxtLink to="/teams" class="nav-link">Teams</NuxtLink>
      <NuxtLink to="/players" class="nav-link">Players</NuxtLink>
    </div>

    <main class="page-container flex-1">
      <slot />
    </main>

    <footer class="site-footer">
      © {{ new Date().getFullYear() }} Busan Bowling League
    </footer>
  </div>
</template>
