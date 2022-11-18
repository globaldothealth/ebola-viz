import {
    ResponsiveContainer,
    CartesianGrid,
    XAxis,
    YAxis,
    Label,
    Tooltip,
    Area,
    AreaChart,
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import enUSLocale from 'date-fns/locale/en-US';
import { formatInTimeZone } from 'date-fns-tz';

interface CumulativeChartProps {
    data: {
        date: Date;
        caseCount: number;
    }[];
}

const CumulativeChart = ({ data }: CumulativeChartProps) => {
    const theme = useTheme();

    return (
        <ResponsiveContainer width="90%" height="80%">
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="cumulative" x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="5%"
                            stopColor={theme.palette.primary.main}
                            stopOpacity={0.8}
                        />
                        <stop
                            offset="95%"
                            stopColor={theme.palette.primary.main}
                            stopOpacity={0}
                        />
                    </linearGradient>
                </defs>
                <CartesianGrid
                    stroke="rgba(0, 0, 0, 0.1)"
                    strokeDasharray="5 5"
                />
                <XAxis
                    dataKey="date"
                    interval="preserveStartEnd"
                    minTickGap={150}
                    tickFormatter={(value: Date) =>
                        formatInTimeZone(value, 'Europe/Berlin', 'LLL d yyyy', {
                            locale: enUSLocale,
                        })
                    }
                    height={50}
                >
                    <Label
                        position="bottom"
                        style={{ textAnchor: 'middle' }}
                        offset={-10}
                    >
                        Date_confirmation
                    </Label>
                </XAxis>
                <YAxis allowDecimals={false}>
                    <Label
                        angle={-90}
                        position="left"
                        offset={-10}
                        style={{ textAnchor: 'middle' }}
                    >
                        Confirmed cases
                    </Label>
                </YAxis>
                <Area
                    type="monotone"
                    dataKey="caseCount"
                    stroke={theme.palette.primary.main}
                    fillOpacity={1}
                    fill="url(#cumulative)"
                />

                <Tooltip
                    formatter={(value: string) => [value, 'Case count']}
                    labelFormatter={(value: Date) =>
                        formatInTimeZone(
                            value,
                            'Europe/Berlin',
                            'E LLL d yyyy',
                            {
                                locale: enUSLocale,
                            },
                        )
                    }
                    cursor={{ fillOpacity: 0.2 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default CumulativeChart;
