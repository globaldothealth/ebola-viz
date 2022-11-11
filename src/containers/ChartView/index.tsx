import { useState, useEffect } from 'react';
import { useAppSelector } from 'redux/hooks';
import { selectChartData } from 'redux/ChartView/selectors';
import { selectSelectedCountryInSideBar } from 'redux/App/selectors';
import { format } from 'date-fns';
import {
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
    BarChart,
    Bar,
    CartesianGrid,
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import Loader from 'components/Loader';

import { ChartContainer } from './styled';

const ChartView = () => {
    const theme = useTheme();

    const chartData = useAppSelector(selectChartData);
    const selectedCountryInSidebar = useAppSelector(
        selectSelectedCountryInSideBar,
    );
    const [isLoading, setIsLoading] = useState(true);

    const selectedCountry = selectedCountryInSidebar
        ? selectedCountryInSidebar.name
        : 'worldwide';

    useEffect(() => {
        setIsLoading(!chartData || !chartData[selectedCountry]);
    }, [chartData, selectedCountry]);

    return (
        <>
            {isLoading ? (
                <Loader />
            ) : (
                <ChartContainer>
                    <ResponsiveContainer width="90%" height="80%">
                        <BarChart data={chartData[selectedCountry]}>
                            <CartesianGrid
                                stroke="rgba(0, 0, 0, 0.1)"
                                strokeDasharray="5 5"
                            />
                            <XAxis
                                dataKey="date"
                                interval="preserveStartEnd"
                                tickFormatter={(value: Date) =>
                                    format(value, 'LLL d yyyy')
                                }
                            />
                            <YAxis allowDecimals={false} />
                            <Bar
                                dataKey="caseCount"
                                fill={theme.palette.primary.main}
                            />

                            <Tooltip
                                formatter={(value: string) => [
                                    value,
                                    'Case count',
                                ]}
                                labelFormatter={(value: Date) =>
                                    format(value, 'E LLL d yyyy')
                                }
                                cursor={{ fillOpacity: 0.2 }}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            )}
        </>
    );
};

export default ChartView;
