#ifndef _FLOW_CONTROL_H_
#define _FLOW_CONTROL_H_

auto PAUSE = [] () {
    std::cout << std::endl
        << "PAUSED. Press Ctrl+C.";
    while(1);
};

#endif
