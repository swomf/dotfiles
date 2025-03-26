CFLAGS = -Oz -flto -Wall -Wextra -Wpedantic
CXXFLAGS = $(CFLAGS)

all: lockstatus organize_workspaces

organize_workspaces: CXXFLAGS += $$(pkg-config --libs jsoncpp)
