CC = gcc
CFLAGS = -Os -flto -ffunction-sections -fdata-sections
CXXFLAGS = $(CFLAGS)
LDFLAGS = -flto

all: lockstatus organize_workspaces

organize_workspaces: CXXFLAGS += $$(pkg-config --libs jsoncpp)
