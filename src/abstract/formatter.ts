const MS_PER_SEC = 1000

function format_w__null(num: number | null, digits: number): string {
    if (null == num) {
        return ''
    }
    return num.toFixed(digits)
}

function format_number0(num: number | null): string {
    return format_w__null(num, 0)
}

function format_number2(num: number | null): string {
    return format_w__null(num, 2)
}

function format_number3(num: number | null): string {
    return format_w__null(num, 3)
}

function to_sw_fixed(time: number, digits: number): string {
    var ret = ''
    if (time < 10) {
        ret = '0'
    }
    return ret + time.toFixed(digits)
}

function format_sw(time: number): string {
    const allsec = time/MS_PER_SEC
    const allmin = allsec/60
    const sec = to_sw_fixed(allsec % 60, 3)
    const min = to_sw_fixed(allmin % 60, 0)
    const hour = to_sw_fixed(allmin/60, 0)

    return `${hour}:${min}:${sec}`
}


export const format = {
    orient:     format_number2,
    speed:      format_number2,
    gps:        format_number3,
    ms_show:    format_number0,
    timer:      format_sw
}