// g++ -o organize_workspaces organize_workspaces.cpp -ljsoncpp
// intended for use with
// https://addons.mozilla.org/en-US/firefox/addon/window-titler where firefox
// windows are titled with a singular integer denoting workspace

#include <cerrno>
#include <cstdio>
#include <cstdlib>
#include <json/json.h>
#include <memory>
#include <string>

std::string exec(const char *cmd) {
  std::array<char, 128> buffer;
  std::string result;
  std::unique_ptr<FILE, int (*)(FILE *)> pipe(popen(cmd, "r"), pclose);
  if (!pipe) {
    throw std::runtime_error("popen() failed");
  }
  while (fgets(buffer.data(), buffer.size(), pipe.get()) != nullptr) {
    result += buffer.data();
  }
  return result;
}

int main() {

  /* The structure of our json is
   * {
   *  "class": "firefox",
   *  "address": a quoted hexadecimal in the form 0x___,
   *  "title": either "[int] text" or "text"
   * }
   */
  const std::string jsonString = exec("hyprctl clients -j");
  Json::Value root;
  Json::Reader reader;

  if (!reader.parse(jsonString.c_str(), root)) {
    throw std::runtime_error("failed to parse json");
  }

  std::ostringstream cmd_stream;
  cmd_stream << "hyprctl --batch \"\n";
  for (const auto &item : root) {
    if (item["class"].asString() != "firefox")
      continue;

    // verify that we start with form [n] where n is an integer
    // not using regex saves 500k lol
    const std::string window_title = item["title"].asString();
    const size_t last_bracket_pos = window_title.find(']');
    if (window_title.length() < 2 || window_title[0] != '[' ||
        last_bracket_pos == std::string::npos)
      continue;
    bool correct_form = true;
    for (int i = 1; i < last_bracket_pos - 1; i++) {
      char c = window_title[i];
      if (c < '0' || c > '9') {
        correct_form = false;
        break;
      }
    }
    if (!correct_form)
      continue;

    std::string workspace = window_title.substr(1, last_bracket_pos - 1);
    cmd_stream << "\tdispatch movetoworkspacesilent "
               << workspace // functionally an int
               << ",address:" << item["address"].asString() << ";\n";
  }
  cmd_stream << '"';
  exec(cmd_stream.str().c_str());

  return 0;
}
