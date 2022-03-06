from cmd import Cmd
import subprocess


def get_brightness() -> dict:
    v = subprocess.getoutput("xrandr --verbose").splitlines()
    m, b = [], []
    primary: str
    for i in v:
        if " connected" in i:
            m.append(i.split()[0])

        if "Brightness" in i:
            b.append(i.split()[1])
    return dict(zip(m, b))


def get_info() -> list:
    x_out = subprocess.getoutput("xrandr").splitlines()
    bright_dict = get_brightness()
    indices = []
    for i, l in enumerate(x_out):
        if " connected" in l:
            indices.append(i)
    indices.append(-1)

    outputs = {}
    for display in range(len(indices) - 1):
        var = x_out[indices[display]:indices[display + 1]]
        recommended = {}
        current = {}
        modes = {}
        for res in var[1:]:
            mode: list = res.split()
            # Recommended & Current
            if '+' in mode:
                plus_index = mode.index("+")
                recommended['mode'] = mode[0]
                recommended['rate'] = float(mode[plus_index - 1])
                mode.pop(plus_index)
            for i, r in enumerate(mode[1:]):
                i += 1
                if '+' in r:
                    mode[i] = float(r[:-2])
                    current['mode'] = recommended['mode'] = mode[0]
                    current['rate'] = recommended['rate'] = float(mode[i])
                elif '*' in r:
                    mode[i] = float(r[:-1])
                    current['mode'] = mode[0]
                    current['rate'] = float(mode[i])

                mode[i] = float(mode[i])

            modes.update({mode[0]: mode[1:]})
        data = {"modes": modes, "rec": recommended, "cur": current}
        outputs.update({var[0]: data})
    
    all_outputs = []
    for k, v in outputs.items():
        output = {}
        output_str = k.replace(k[k.find('('):], "")
        loutput_str = output_str.lower()

        # Display Name
        display = output_str.split()[0]
        output["display"] = display
        # Primary Boolean
        output["primary"] = "primary" in output_str
        # Brightness
        brightness = float(bright_dict[display])
        output["brightness"] = brightness
        # Scale
        if output["primary"]:
            index = 3
        else:
            index = 2
        scaled_res = int(output_str.split()[index].split("+")[0].split("x")[0])
        res = int(v["cur"]["mode"].split("x")[0])
        scale = round(scaled_res / res, 2)
        output["scale"] = scale
        # Orientation
        orientations = ['left', 'inverted', 'right', 'normal']
        orientation = ""
        for i in orientations:
            if i != 'normal':
                if i in loutput_str:
                    orientation = i
                    break
            else:
                orientation = i
        output["orientation"] = orientation
        # Mirror
        mirror: str
        if "x and y axis" in loutput_str:
            mirror = 'xy'
        elif 'x axis' in loutput_str:
            mirror = 'x'
        elif 'y axis' in loutput_str:
            mirror = 'y'
        else:
            mirror = 'normal'
        output['mirror'] = mirror
        # Modes
        output["modes"] = v
        all_outputs.append(output)

    return all_outputs


def get_data(display, info):
    for i in info:
        if i["display"] == display:
            return i
    

def set_info(post):
    print("Updated Settings")
    info = get_info()
    
    ## Set Display & Get Data
    display = post["displaySelect"]
    data = get_data(display, info)
    cmd_display = f"xrandr --output {display}"
    
    ## Set Resolution and Rate
    mode = post["modeSelect"].split()[0]
    rate = float(post["rateSelect"].split()[0])
    if mode != data["modes"]["cur"]["mode"] or rate != data["modes"]["cur"]["rate"]:
        subprocess.run(f"{cmd_display} --mode {mode} --rate {rate}".split())
    
    ## Set Brightness
    brightness = float(post["brightness"])
    if brightness != data["brightness"]:
        subprocess.run(f"{cmd_display} --brightness {brightness}".split())
        
    ## Set Orientation
    options = ["normal", "right", "inverted", "left"]
    orientation = options[int(post["orientation"])-1]
    if orientation != data["orientation"]:
        subprocess.run(f"{cmd_display} --rotate {orientation}".split())

    ## Set Mirroring
    x, y = bool(int(post["horizon-mirror"])), bool(int(post["vert-mirror"]))
    mirror = ""
    if x:
        mirror += 'x'
    if y:
        mirror += 'y'
    if mirror == "":
        mirror = "normal"
    
    if mirror != data["mirror"]:
        subprocess.run(f"{cmd_display} --reflect {mirror}".split())
        
    ## Set Scale
    scale = float(post["scale"])
    
    if scale != data["scale"]:
        subprocess.run(f"{cmd_display} --scale {scale}x{scale}".split())

