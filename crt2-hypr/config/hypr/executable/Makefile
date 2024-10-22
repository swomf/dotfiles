CC = gcc
CFLAGS = -Os -flto -ffunction-sections -fdata-sections
LDFLAGS = -flto

all: lockstatus organize_workspaces

lockstatus: lockstatus.c
	$(CC) -o lockstatus lockstatus.c $(CFLAGS)

organize_workspaces: organize_workspaces.cpp
	$(CXX) -o organize_workspaces organize_workspaces.cpp `pkg-config --libs jsoncpp`
