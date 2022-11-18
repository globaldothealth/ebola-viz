import {
    ResponsiveContainer,
    BarChart as RechartsBarChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Label,
    Bar,
    Tooltip,
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import { format } from 'date-fns';

interface BarChartProps {
    data: {
        date: Date;
        caseCount: number;
    }[];
}

const BarChart = ({ data }: BarChartProps) => {
    const theme = useTheme();

    return (
        <ResponsiveContainer width="90%" height="80%">
            <RechartsBarChart data={data}>
                <CartesianGrid
                    stroke="rgba(0, 0, 0, 0.1)"
                    strokeDasharray="5 5"
                />
                <XAxis
                    dataKey="date"
                    interval="preserveStartEnd"
                    tickFormatter={(value: Date) => format(value, 'LLL d yyyy')}
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
                <Bar dataKey="caseCount" fill={theme.palette.primary.main} />

                <Tooltip
                    formatter={(value: string) => [value, 'Case count']}
                    labelFormatter={(value: Date) =>
                        format(value, 'E LLL d yyyy')
                    }
                    cursor={{ fillOpacity: 0.2 }}
                />
            </RechartsBarChart>
        </ResponsiveContainer>
    );
};

export default BarChart;
