// formatted with `clang-format --style=llvm`

#include <stdio.h>
#include <string.h>
#include <time.h>

#define RECT_LEN 17
#define DATE_LEN 18
#define MEM_LEN 5 // e.g. 15.3
#define BATTERY_DIR "/sys/class/power_supply/BAT1"

typedef enum { kB, MiB, GiB, TiB } data_size;
const char *data_size_str[] = {"kB", "MiB", "GiB", "TiB"};
typedef struct {
  float used;
  data_size used_unit;
  float total;
  data_size total_unit;
} Mem;

int update_date(char *date_str, size_t date_len);
int update_battery_percent(int *battery_percent);
int update_memory(Mem *mem);

int main() {
  char date_str[DATE_LEN];
  int battery_percent;
  Mem mem = {0, kB, 0, kB};

  if (update_date(date_str, DATE_LEN) != 0) {
    fprintf(stderr, "fail: update_date\n");
    return 1;
  }

  if (update_battery_percent(&battery_percent) != 0) {
    fprintf(stderr, "fail: update_battery_percent\n");
    return 1;
  }

  if (update_memory(&mem) != 0) {
    fprintf(stderr, "fail: update_memory\n");
    return 1;
  }

  // Print results
  printf("\u2007%*s\n", RECT_LEN - 1, date_str);
  printf("%*d%%\n", RECT_LEN - 1, battery_percent);
  char mem_str[RECT_LEN];
  char mem_used_str[MEM_LEN];
  char mem_total_str[MEM_LEN];
  snprintf(mem_used_str, MEM_LEN, "%4.1f%s", mem.used,
           data_size_str[mem.used_unit]);
  snprintf(mem_total_str, MEM_LEN, "%4.1f%s", mem.total,
           data_size_str[mem.total_unit]);
  snprintf(mem_str, RECT_LEN, "%s%s / %s%s", mem_used_str,
           data_size_str[mem.used_unit], mem_total_str,
           data_size_str[mem.total_unit]);
  printf("%*s\n", RECT_LEN, mem_str);
  

  return 0;
}

int update_date(char *date_str, size_t date_len) {
  time_t now = time(NULL);
  struct tm *tm = localtime(&now);
  if (strftime(date_str, date_len, "%Y-%m-%d %H:%M", tm) == 0) {
    return -1;
  }
  return 0;
}

int update_battery_percent(int *battery_percent) {
  FILE *fp = fopen(BATTERY_DIR "/capacity", "r");
  if (fp == NULL) {
    perror("Failed to open battery capacity file");
    return -1;
  }
  if (fscanf(fp, "%d", battery_percent) != 1) {
    perror("Failed to read battery capacity");
    fclose(fp);
    return -1;
  }
  fclose(fp);
  return 0;
}

int update_memory(Mem *mem) {
  FILE *fp = fopen("/proc/meminfo", "r");
  if (fp == NULL) {
    perror("Failed to open memory info file");
    return -1;
  }

  char line[128];
  float available;
  while (fgets(line, sizeof(line), fp) != NULL) {
    if (strncmp(line, "MemTotal:", 9) == 0) {
      sscanf(line, "MemTotal: %f kB", &mem->total);
    } else if (strncmp(line, "MemAvailable:", 13) == 0) {
      sscanf(line, "MemAvailable: %f kB", &available);
    }
  }
  mem->used = mem->total - available;
  fclose(fp);

  while (mem->total >= 1000) {
    mem->total /= 1024.0;
    mem->total_unit++;
  }
  while (mem->used >= 1000) {
    mem->used /= 1024.0;
    mem->used_unit++;
  }

  return 0;
}
